package edu.cit.canete.laundrylink.shared.notification;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    public void sendWelcomeEmail(String toEmail, String firstName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to LaundryLink!");
            helper.setText("""
                <html><body>
                <h2>Welcome to LaundryLink, %s!</h2>
                <p>Your account has been created successfully.</p>
                <p>You can now browse laundry shops and book your slots at
                <a href="%s">LaundryLink</a>.</p>
                <br><p>— The LaundryLink Team</p>
                </body></html>
                """.formatted(firstName, frontendUrl), true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email to " + toEmail + ": " + e.getMessage());
        }
    }

    @Async
    public void sendBookingConfirmationEmail(
            String toEmail,
            String customerName,
            String bookingCode,
            String shopName,
            String serviceName,
            String bookingDate,
            String timeSlot,
            String amount) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("LaundryLink – Booking Confirmed: " + bookingCode);
            helper.setText("""
                <html><body>
                <h2>Booking Confirmed!</h2>
                <p>Hi %s, your payment was successful. Here are your booking details:</p>
                <table>
                  <tr><td><strong>Booking Code</strong></td><td>%s</td></tr>
                  <tr><td><strong>Shop</strong></td><td>%s</td></tr>
                  <tr><td><strong>Service</strong></td><td>%s</td></tr>
                  <tr><td><strong>Date</strong></td><td>%s</td></tr>
                  <tr><td><strong>Time</strong></td><td>%s</td></tr>
                  <tr><td><strong>Amount Paid</strong></td><td>PHP %s</td></tr>
                </table>
                <p>Show your booking code or QR code when dropping off your laundry.</p>
                <br><p>— The LaundryLink Team</p>
                </body></html>
                """.formatted(customerName, bookingCode, shopName, serviceName,
                    bookingDate, timeSlot, amount), true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send confirmation email to " + toEmail + ": " + e.getMessage());
        }
    }
}
