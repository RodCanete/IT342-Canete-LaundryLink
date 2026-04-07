package edu.cit.canete.laundrylink.service.adapter;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

public interface GooglePayloadAdapter {
    GoogleOAuthProfile adapt(GoogleIdToken.Payload payload);
}
