package edu.cit.canete.laundrylink.features.auth.adapter;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

public interface GooglePayloadAdapter {
    GoogleOAuthProfile adapt(GoogleIdToken.Payload payload);
}
