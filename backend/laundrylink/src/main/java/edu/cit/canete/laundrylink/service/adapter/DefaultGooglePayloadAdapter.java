package edu.cit.canete.laundrylink.service.adapter;

import org.springframework.stereotype.Component;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

@Component
public class DefaultGooglePayloadAdapter implements GooglePayloadAdapter {

    @Override
    public GoogleOAuthProfile adapt(GoogleIdToken.Payload payload) {
        String email = text(payload.getEmail());
        String oauthId = text(payload.getSubject());

        String fullName = text(payload.get("name"));
        String givenName = text(payload.get("given_name"));
        String familyName = text(payload.get("family_name"));

        if (givenName == null || familyName == null) {
            String[] parts = splitName(fullName);
            if (givenName == null) {
                givenName = parts[0];
            }
            if (familyName == null) {
                familyName = parts[1];
            }
        }

        return new GoogleOAuthProfile(email, oauthId, givenName, familyName);
    }

    private String text(Object value) {
        if (value == null) {
            return null;
        }

        String normalized = value.toString().trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String[] splitName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return new String[] { "Google", "User" };
        }

        String trimmed = fullName.trim();
        int firstSpaceIndex = trimmed.indexOf(' ');
        if (firstSpaceIndex < 0) {
            return new String[] { trimmed, "User" };
        }

        String firstName = trimmed.substring(0, firstSpaceIndex).trim();
        String lastName = trimmed.substring(firstSpaceIndex + 1).trim();
        if (lastName.isBlank()) {
            lastName = "User";
        }

        return new String[] { firstName.isBlank() ? "Google" : firstName, lastName };
    }
}
