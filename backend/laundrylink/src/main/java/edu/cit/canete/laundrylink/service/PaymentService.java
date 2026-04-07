package edu.cit.canete.laundrylink.service;

import edu.cit.canete.laundrylink.dto.CreatePaymentIntentRequest;
import edu.cit.canete.laundrylink.entity.Booking;
import edu.cit.canete.laundrylink.entity.BookingStatus;
import edu.cit.canete.laundrylink.entity.Payment;
import edu.cit.canete.laundrylink.entity.PaymentStatus;
import edu.cit.canete.laundrylink.entity.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.cit.canete.laundrylink.repository.BookingRepository;
import edu.cit.canete.laundrylink.repository.PaymentRepository;
import edu.cit.canete.laundrylink.service.event.PaymentSucceededEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HexFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    private static final String DEFAULT_CURRENCY = "PHP";

    @Autowired
    private HttpClient httpClient;

    @Value("${app.paymongo.base-url}")
    private String payMongoBaseUrl;

    @Value("${app.paymongo.secret-key:}")
    private String payMongoSecretKey;

    @Value("${app.paymongo.require-test-key:true}")
    private boolean payMongoRequireTestKey;

    @Value("${app.paymongo.webhook-secret:}")
    private String payMongoWebhookSecret;

    @Value("${app.paymongo.success-url}")
    private String payMongoSuccessUrlTemplate;

    @Value("${app.paymongo.cancel-url}")
    private String payMongoCancelUrlTemplate;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private AuthenticatedUserService authenticatedUserService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    public Map<String, Object> createIntent(CreatePaymentIntentRequest request, String authorizationHeader) {
        User user = authenticatedUserService.requireUser(authorizationHeader);
        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new RuntimeException("BOOKING-001: Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("AUTH-003: You can only pay your own booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new RuntimeException("PAYMENT-001: Booking is not pending payment");
        }

        requireSecretKey();

        Payment payment = paymentRepository.findByBooking_Id(booking.getId()).orElseGet(Payment::new);
        payment.setBooking(booking);
        BigDecimal amount = booking.getService().getPrice();
        payment.setAmount(amount);
        payment.setCurrency(DEFAULT_CURRENCY);
        payment.setStatus(PaymentStatus.PENDING);
        if (payment.getPaymentIntentId() == null || payment.getPaymentIntentId().isBlank()) {
            payment.setPaymentIntentId("pi_" + UUID.randomUUID().toString().replace("-", ""));
        }

        PayMongoCheckoutSession session = createCheckoutSession(booking, payment);
        payment.setCheckoutSessionId(session.checkoutSessionId());

        Payment saved = paymentRepository.save(payment);
        Map<String, Object> response = new HashMap<>();
        response.put("paymentIntentId", saved.getPaymentIntentId());
        response.put("checkoutSessionId", saved.getCheckoutSessionId());
        response.put("bookingId", booking.getId());
        response.put("amount", saved.getAmount());
        response.put("currency", saved.getCurrency());
        response.put("status", saved.getStatus());
        response.put("checkoutUrl", session.checkoutUrl());
        return response;
    }

    public Map<String, Object> handleWebhook(String payload, String signatureHeader, String fallbackPaymentIntentId) {
        verifyWebhookSignature(payload, signatureHeader);

        String eventType = extractEventType(payload);
        String checkoutSessionId = extractCheckoutSessionId(payload);
        String paymentIntentIdFromPayload = extractPaymentIntentId(payload);

        Optional<Payment> paymentByCheckout = checkoutSessionId == null
            ? Optional.empty()
            : paymentRepository.findByCheckoutSessionId(checkoutSessionId);

        Optional<Payment> paymentByIntent = paymentByCheckout.isPresent()
            ? paymentByCheckout
            : findPaymentByIntent(paymentIntentIdFromPayload);

        Payment payment = paymentByIntent
            .or(() -> findPaymentByIntent(fallbackPaymentIntentId))
            .orElseThrow(() -> new RuntimeException("PAYMENT-001: Payment not found for webhook event"));

        PaymentStatus mappedStatus = mapStatusFromEvent(eventType);
        if (mappedStatus == null) {
            return toPaymentMap(payment, eventType);
        }

        payment.setStatus(mappedStatus);
        if (mappedStatus == PaymentStatus.SUCCEEDED) {
            payment.setPaidAt(LocalDateTime.now());
            publishPaymentSucceeded(payment.getBooking().getId());
        }

        paymentRepository.save(payment);
        return toPaymentMap(payment, eventType);
    }

    public Map<String, Object> getPaymentByBooking(UUID bookingId, String authorizationHeader) {
        User user = authenticatedUserService.requireUser(authorizationHeader);
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("BOOKING-001: Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("AUTH-003: You can only access your own booking");
        }

        Payment payment = paymentRepository.findByBooking_Id(bookingId)
            .orElseThrow(() -> new RuntimeException("PAYMENT-001: No payment initialized for this booking"));

        payment = reconcilePaymentStatus(payment);

        return toPaymentMap(payment, null);
    }

    private Payment reconcilePaymentStatus(Payment payment) {
        if (payment.getStatus() != PaymentStatus.PENDING) {
            return payment;
        }

        String checkoutSessionId = payment.getCheckoutSessionId();
        if (checkoutSessionId == null || checkoutSessionId.isBlank()) {
            return payment;
        }

        String secretKey = resolveSecretKey();
        if (secretKey == null) {
            return payment;
        }

        try {
            PaymentStatus providerStatus = fetchCheckoutSessionStatus(checkoutSessionId, secretKey);
            if (providerStatus == null || providerStatus == payment.getStatus()) {
                return payment;
            }

            payment.setStatus(providerStatus);
            if (providerStatus == PaymentStatus.SUCCEEDED) {
                if (payment.getPaidAt() == null) {
                    payment.setPaidAt(LocalDateTime.now());
                }
                publishPaymentSucceeded(payment.getBooking().getId());
                payment.getBooking().setStatus(BookingStatus.PAID);
            }

            return paymentRepository.save(payment);
        } catch (Exception e) {
            return payment;
        }
    }

    private PaymentStatus fetchCheckoutSessionStatus(String checkoutSessionId, String secretKey) {
        try {
            String basicAuth = Base64.getEncoder().encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(payMongoBaseUrl + "/checkout_sessions/" + checkoutSessionId))
                .header("Authorization", "Basic " + basicAuth)
                .header("Accept", "application/json")
                .GET()
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                return null;
            }

            JsonNode root = objectMapper.readTree(response.body());
            String providerStatus = firstText(root, List.of(
                "/data/attributes/payment_intent/attributes/status",
                "/data/attributes/payments/0/attributes/status",
                "/data/attributes/status"
            ));

            return mapStatusFromProvider(providerStatus);
        } catch (Exception e) {
            return null;
        }
    }

    private PaymentStatus mapStatusFromProvider(String providerStatus) {
        if (providerStatus == null) {
            return null;
        }

        String normalized = providerStatus.toLowerCase();
        if (normalized.contains("paid") || normalized.contains("succeed")) {
            return PaymentStatus.SUCCEEDED;
        }
        if (normalized.contains("fail") || normalized.contains("cancel") || normalized.contains("expire")) {
            return PaymentStatus.FAILED;
        }
        if (normalized.contains("refund")) {
            return PaymentStatus.REFUNDED;
        }

        return null;
    }

    private PayMongoCheckoutSession createCheckoutSession(Booking booking, Payment payment) {
        try {
            String requestBody = objectMapper.writeValueAsString(Map.of(
                "data", Map.of(
                    "attributes", Map.of(
                        "billing", Map.of("name", booking.getUser().getFirstName() + " " + booking.getUser().getLastName()),
                        "line_items", List.of(Map.of(
                            "currency", DEFAULT_CURRENCY,
                            "amount", toMinorUnit(booking.getService().getPrice()),
                            "name", booking.getService().getName(),
                            "quantity", 1,
                            "description", "Laundry booking " + booking.getBookingCode()
                        )),
                        "payment_method_types", List.of("gcash", "paymaya", "card"),
                        "metadata", Map.of(
                            "booking_id", booking.getId().toString(),
                            "payment_intent_id", payment.getPaymentIntentId()
                        ),
                        "success_url", resolveReturnUrl(payMongoSuccessUrlTemplate, booking.getId()),
                        "cancel_url", resolveReturnUrl(payMongoCancelUrlTemplate, booking.getId()),
                        "description", "LaundryLink booking " + booking.getBookingCode()
                    )
                )
            ));

            String secretKey = requireSecretKey();
            String basicAuth = Base64.getEncoder().encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(payMongoBaseUrl + "/checkout_sessions"))
                .header("Authorization", "Basic " + basicAuth)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new RuntimeException("PAYMENT-003: Failed to create PayMongo checkout session");
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode dataNode = root.path("data");
            String checkoutSessionId = textValue(dataNode.path("id"));
            String checkoutUrl = textValue(dataNode.path("attributes").path("checkout_url"));
            if (checkoutSessionId == null || checkoutUrl == null) {
                throw new RuntimeException("PAYMENT-003: Invalid PayMongo checkout response");
            }

            return new PayMongoCheckoutSession(checkoutSessionId, checkoutUrl);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("PAYMENT-003: Failed to create PayMongo checkout session", e);
        }
    }

    private int toMinorUnit(BigDecimal amount) {
        return amount.movePointRight(2).intValueExact();
    }

    private String resolveReturnUrl(String template, UUID bookingId) {
        return template.replace("{bookingId}", bookingId.toString());
    }

    private String requireSecretKey() {
        String secretKey = resolveSecretKey();
        if (secretKey == null) {
            throw new RuntimeException("PAYMENT-002: Missing PAYMONGO_SECRET_KEY");
        }
        if (payMongoRequireTestKey && !secretKey.startsWith("sk_test_")) {
            throw new RuntimeException("PAYMENT-002: PAYMONGO_SECRET_KEY must be a PayMongo test key (sk_test_)");
        }
        return secretKey;
    }

    private String resolveSecretKey() {
        String[] candidates = new String[] {
            payMongoSecretKey,
            System.getProperty("PAYMONGO_SECRET_KEY"),
            System.getenv("PAYMONGO_SECRET_KEY")
        };

        for (String candidate : candidates) {
            if (candidate != null) {
                String trimmed = candidate.trim();
                if (!trimmed.isEmpty()) {
                    payMongoSecretKey = trimmed;
                    return trimmed;
                }
            }
        }

        return null;
    }

    private Optional<Payment> findPaymentByIntent(String paymentIntentId) {
        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            return Optional.empty();
        }
        return paymentRepository.findByPaymentIntentId(paymentIntentId);
    }

    private String extractEventType(String payload) {
        try {
            JsonNode root = objectMapper.readTree(payload == null ? "{}" : payload);
            return firstText(root, List.of(
                "/data/attributes/type",
                "/data/type",
                "/type"
            ));
        } catch (Exception e) {
            return null;
        }
    }

    private String extractCheckoutSessionId(String payload) {
        try {
            JsonNode root = objectMapper.readTree(payload == null ? "{}" : payload);
            return firstText(root, List.of(
                "/data/attributes/data/id",
                "/data/attributes/data/attributes/checkout_session_id",
                "/data/attributes/resource_id",
                "/data/id"
            ));
        } catch (Exception e) {
            return null;
        }
    }

    private String extractPaymentIntentId(String payload) {
        try {
            JsonNode root = objectMapper.readTree(payload == null ? "{}" : payload);
            return firstText(root, List.of(
                "/data/attributes/data/attributes/metadata/payment_intent_id",
                "/data/attributes/data/attributes/payment_intent_id",
                "/data/attributes/metadata/payment_intent_id"
            ));
        } catch (Exception e) {
            return null;
        }
    }

    private String firstText(JsonNode root, List<String> pointers) {
        for (String pointer : pointers) {
            String value = textValue(root.at(pointer));
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private String textValue(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        String value = node.asText(null);
        return value == null || value.isBlank() ? null : value;
    }

    private PaymentStatus mapStatusFromEvent(String eventType) {
        if (eventType == null) {
            return null;
        }

        String normalized = eventType.toLowerCase();
        if (normalized.contains("paid") || normalized.contains("succeed")) {
            return PaymentStatus.SUCCEEDED;
        }
        if (normalized.contains("fail") || normalized.contains("cancel")) {
            return PaymentStatus.FAILED;
        }
        if (normalized.contains("refund")) {
            return PaymentStatus.REFUNDED;
        }
        return null;
    }

    private void verifyWebhookSignature(String payload, String signatureHeader) {
        if (payMongoWebhookSecret == null || payMongoWebhookSecret.isBlank()) {
            return;
        }

        if (signatureHeader == null || signatureHeader.isBlank()) {
            throw new RuntimeException("PAYMENT-004: Missing webhook signature");
        }

        Map<String, String> signatureValues = parseSignatureHeader(signatureHeader);
        List<String> candidateSignatures = new ArrayList<>();
        addIfPresent(candidateSignatures, signatureValues.get("v1"));
        addIfPresent(candidateSignatures, signatureValues.get("te"));
        addIfPresent(candidateSignatures, signatureValues.get("sig"));
        addIfPresent(candidateSignatures, signatureValues.get("signature"));

        String timestamp = firstNonBlank(signatureValues.get("t"), signatureValues.get("ts"), signatureValues.get("timestamp"));
        String safePayload = payload == null ? "" : payload;

        String digestWithTimestamp = timestamp == null
            ? null
            : hmacSha256Hex(payMongoWebhookSecret, timestamp + "." + safePayload);
        String digestPayloadOnly = hmacSha256Hex(payMongoWebhookSecret, safePayload);

        boolean matched = candidateSignatures.stream().anyMatch(sig ->
            equalsIgnoreCase(sig, digestWithTimestamp) || equalsIgnoreCase(sig, digestPayloadOnly)
        );

        if (!matched) {
            throw new RuntimeException("PAYMENT-004: Invalid webhook signature");
        }
    }

    private Map<String, String> parseSignatureHeader(String signatureHeader) {
        Map<String, String> values = new HashMap<>();
        for (String part : signatureHeader.split(",")) {
            String[] pair = part.trim().split("=", 2);
            if (pair.length == 2) {
                values.put(pair[0].trim().toLowerCase(), pair[1].trim());
            }
        }
        return values;
    }

    private String hmacSha256Hex(String secret, String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new RuntimeException("PAYMENT-004: Failed to verify webhook signature", e);
        }
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private boolean equalsIgnoreCase(String a, String b) {
        return a != null && b != null && a.equalsIgnoreCase(b);
    }

    private void addIfPresent(List<String> target, String value) {
        if (value != null && !value.isBlank()) {
            target.add(value);
        }
    }

    private void publishPaymentSucceeded(UUID bookingId) {
        eventPublisher.publishEvent(new PaymentSucceededEvent(bookingId));
    }

    private Map<String, Object> toPaymentMap(Payment payment, String eventType) {
        Map<String, Object> response = new HashMap<>();
        response.put("paymentIntentId", payment.getPaymentIntentId());
        response.put("checkoutSessionId", payment.getCheckoutSessionId());
        response.put("status", payment.getStatus());
        response.put("paidAt", payment.getPaidAt());
        response.put("bookingId", payment.getBooking().getId());
        response.put("bookingStatus", payment.getBooking().getStatus());
        response.put("amount", payment.getAmount());
        response.put("currency", payment.getCurrency());
        if (eventType != null) {
            response.put("eventType", eventType);
        }
        return response;
    }

    private record PayMongoCheckoutSession(String checkoutSessionId, String checkoutUrl) {}
}