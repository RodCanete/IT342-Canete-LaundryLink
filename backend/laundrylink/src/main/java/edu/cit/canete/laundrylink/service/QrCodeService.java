package edu.cit.canete.laundrylink.service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;

import javax.imageio.ImageIO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import java.util.HashMap;
import java.util.Map;

@Service
public class QrCodeService {

    private static final Logger log = LoggerFactory.getLogger(QrCodeService.class);
    private static final int SIZE = 256;

    public String generateBase64DataUrl(String content) {
        if (content == null || content.isBlank()) {
            return null;
        }

        try {
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
            hints.put(EncodeHintType.MARGIN, 1);

            BitMatrix matrix = new QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, SIZE, SIZE, hints);
            BufferedImage image = MatrixToImageWriter.toBufferedImage(matrix);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", baos);

            String encoded = Base64.getEncoder().encodeToString(baos.toByteArray());
            return "data:image/png;base64," + encoded;
        } catch (Exception e) {
            log.warn("Failed to generate QR code for content '{}': {}", content, e.getMessage());
            return null;
        }
    }
}
