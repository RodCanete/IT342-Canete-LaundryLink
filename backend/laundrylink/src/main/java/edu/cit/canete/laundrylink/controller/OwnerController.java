package edu.cit.canete.laundrylink.controller;

import edu.cit.canete.laundrylink.dto.CreateServiceRequest;
import edu.cit.canete.laundrylink.dto.CreateSlotConfigRequest;
import edu.cit.canete.laundrylink.dto.UpdateBookingStatusRequest;
import edu.cit.canete.laundrylink.dto.UpdateServiceRequest;
import edu.cit.canete.laundrylink.dto.UpdateShopRequest;
import edu.cit.canete.laundrylink.dto.UpdateSlotConfigRequest;
import edu.cit.canete.laundrylink.entity.BookingStatus;
import edu.cit.canete.laundrylink.entity.User;
import edu.cit.canete.laundrylink.service.ApiResponseFactory;
import edu.cit.canete.laundrylink.service.AuthenticatedUserService;
import edu.cit.canete.laundrylink.service.BookingService;
import edu.cit.canete.laundrylink.service.OwnerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/owner")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class OwnerController {

    @Autowired
    private OwnerService ownerService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private AuthenticatedUserService authenticatedUserService;

    @Autowired
    private ApiResponseFactory responseFactory;

    @GetMapping("/shop")
    public ResponseEntity<?> getMyShop(@RequestHeader(name = "Authorization", required = false) String auth) {
        try {
            User owner = authenticatedUserService.requireUser(auth);
            return ResponseEntity.ok(responseFactory.success(ownerService.getMyShop(owner)));
        } catch (RuntimeException e) {
            return errorFor(e);
        }
    }

    @PutMapping("/shop")
    public ResponseEntity<?> updateMyShop(
        @Valid @RequestBody UpdateShopRequest req,
        @RequestHeader(name = "Authorization", required = false) String auth
    ) {
        try {
            User owner = authenticatedUserService.requireUser(auth);
            return ResponseEntity.ok(responseFactory.success(ownerService.updateMyShop(owner, req)));
        } catch (RuntimeException e) {
            return errorFor(e);
        }
    }

    @GetMapping("/services")
    public ResponseEntity<?> listMyServices(@RequestHeader(name = "Authorization", required = false) String auth) {
        try {
            User owner = authenticatedUserService.requireUser(auth);
            return ResponseEntity.ok(responseFactory.success(ownerService.listMyServices(owner)));
        } catch (RuntimeException e) {
            return errorFor(e);
        }
    }

    @PostMapping("/services")
    public ResponseEntity<?> createService(
        @Valid @RequestBody CreateServiceRequest req,
        @RequestHeader(name = "Authorization", required = false) String auth
    ) {
        try {
            User owner = authenticatedUserService.requireUser(auth);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(responseFactory.success(ownerService.createService(owner, req)));
        } catch (RuntimeException e) {
            return errorFor(e);
        }
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<?> updateService(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateServiceRequest req,
        @RequestHeader(name = "Authorization", required = false) String auth
    ) {
        try {
            User owner = authenticatedUserService.requireUser(auth);
            return ResponseEntity.ok(responseFactory.success(ownerService.updateService(owner, id, req)));
        } catch (RuntimeException e) {
            return errorFor(e);
        }
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<?> deleteService(
        @PathVariable UUID id,
        @RequestHeader(name = "Authorization", required = false) String auth
    ) {
        try {
            User owner = authenticatedUserService.requireUser(auth);
            ownerService.deleteService(owner, id);
            return ResponseEntity.ok(responseFactory.success(null));
        } catch (RuntimeException e) {
            return errorFor(e);
        }
    }

    @GetMapping("/slots")
    public ResponseEntity<?> listMySlots(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(required = false) UUID serviceId,
        @RequestHeader(name = "Authorization", required = false) String auth
    ) {
        try {
            User owner = authenticatedUserService.requireUser(auth);
            return ResponseEntity.ok(responseFactory.success(ownerService.listMySlots(owner, date, serviceId)));
        } catch (RuntimeException e) {
            return errorFor(e);
        }
    }

    @PostMapping("/slots")
    public ResponseEntity<?> createSlot(
        @Valid @RequestBody CreateSlotConfigRequest req,
        @RequestHeader(name = "Authorization", required = false) String auth
    ) {
        try {
            User owner = authenticatedUserService.requireUser(auth);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(responseFactory.success(ownerService.createSlot(owner, req)));
        } catch (RuntimeException e) {
            return errorFor(e);
        }
    }

    @PutMapping("/slots/{id}")
    public ResponseEntity<?> updateSlot(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateSlotConfigRequest req,
        @RequestHeader(name = "Authorization", required = false) String auth
    ) {
        try {
            User owner = authenticatedUserService.requireUser(auth);
            return ResponseEntity.ok(responseFactory.success(ownerService.updateSlot(owner, id, req)));
        } catch (RuntimeException e) {
            return errorFor(e);
        }
    }

    @DeleteMapping("/slots/{id}")
    public ResponseEntity<?> deleteSlot(
        @PathVariable UUID id,
        @RequestHeader(name = "Authorization", required = false) String auth
    ) {
        try {
            User owner = authenticatedUserService.requireUser(auth);
            ownerService.deleteSlot(owner, id);
            return ResponseEntity.ok(responseFactory.success(null));
        } catch (RuntimeException e) {
            return errorFor(e);
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> listMyBookings(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(required = false) BookingStatus status,
        @RequestHeader(name = "Authorization", required = false) String auth
    ) {
        try {
            User owner = authenticatedUserService.requireUser(auth);
            return ResponseEntity.ok(responseFactory.success(ownerService.listMyBookings(owner, date, status)));
        } catch (RuntimeException e) {
            return errorFor(e);
        }
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateBookingStatusRequest req,
        @RequestHeader(name = "Authorization", required = false) String auth
    ) {
        try {
            User owner = authenticatedUserService.requireUser(auth);
            var saved = bookingService.updateStatus(id, req.getStatus(), owner);
            return ResponseEntity.ok(responseFactory.success(
                ownerService.toOwnerBookingResponse(saved)
            ));
        } catch (RuntimeException e) {
            return errorFor(e);
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@RequestHeader(name = "Authorization", required = false) String auth) {
        try {
            User owner = authenticatedUserService.requireUser(auth);
            return ResponseEntity.ok(responseFactory.success(ownerService.getDashboard(owner)));
        } catch (RuntimeException e) {
            return errorFor(e);
        }
    }

    private ResponseEntity<?> errorFor(RuntimeException e) {
        String msg = e.getMessage() == null ? "Request failed" : e.getMessage();
        HttpStatus status;
        String code;
        if (msg.startsWith("AUTH-")) {
            status = HttpStatus.FORBIDDEN;
            code = msg.split(":")[0];
        } else if (msg.startsWith("OWNER-")) {
            status = HttpStatus.NOT_FOUND;
            code = msg.split(":")[0];
        } else if (msg.startsWith("SERVICE-") || msg.startsWith("SLOT-004")) {
            status = HttpStatus.NOT_FOUND;
            code = msg.split(":")[0];
        } else if (msg.startsWith("SLOT-") || msg.startsWith("BOOKING-002")) {
            status = HttpStatus.BAD_REQUEST;
            code = msg.split(":")[0];
        } else if (msg.startsWith("BOOKING-")) {
            status = HttpStatus.NOT_FOUND;
            code = msg.split(":")[0];
        } else if (msg.startsWith("Missing or invalid Authorization") || msg.startsWith("Invalid or expired token")) {
            status = HttpStatus.UNAUTHORIZED;
            code = "AUTH-001";
        } else {
            status = HttpStatus.BAD_REQUEST;
            code = "OWNER-999";
        }
        return ResponseEntity.status(status).body(responseFactory.error(code, msg));
    }
}
