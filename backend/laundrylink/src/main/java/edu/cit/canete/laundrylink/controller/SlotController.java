package edu.cit.canete.laundrylink.controller;

import edu.cit.canete.laundrylink.service.ApiResponseFactory;
import edu.cit.canete.laundrylink.service.SlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class SlotController {

    @Autowired
    private SlotService slotService;

    @Autowired
    private ApiResponseFactory responseFactory;

    @GetMapping
    public ResponseEntity<?> listSlots(
        @RequestParam UUID shopId,
        @RequestParam UUID serviceId,
        @RequestParam LocalDate date
    ) {
        return ResponseEntity.ok(responseFactory.success(slotService.getSlots(shopId, serviceId, date)));
    }
}