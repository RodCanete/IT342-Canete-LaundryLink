package edu.cit.canete.laundrylink.controller;

import edu.cit.canete.laundrylink.service.ApiResponseFactory;
import edu.cit.canete.laundrylink.service.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/shops")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class ShopController {

    @Autowired
    private ShopService shopService;

    @Autowired
    private ApiResponseFactory responseFactory;

    @GetMapping
    public ResponseEntity<?> listShops() {
        return ResponseEntity.ok(responseFactory.success(shopService.listShops()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getShop(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(responseFactory.success(shopService.getShop(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseFactory.error("SHOP-001", e.getMessage()));
        }
    }

    @GetMapping("/{id}/services")
    public ResponseEntity<?> getShopServices(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(responseFactory.success(shopService.listShopServices(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(responseFactory.error("SHOP-001", e.getMessage()));
        }
    }
}