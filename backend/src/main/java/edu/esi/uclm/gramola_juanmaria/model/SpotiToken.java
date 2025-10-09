package edu.esi.uclm.gramola_juanmaria.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/* Esta clase no hace falta que la hagamos */
public class SpotiToken {
    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("token_type")
    private String tokenType;

    @JsonProperty("expires_in")
    private int expiresIn;

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
    public String getAccessToken() {
        return this.accessToken;
    }
    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }
    public String getTokenType() {
        return this.tokenType;
    }
    public void setExpiresIn(int expiresIn) {
        this.expiresIn = expiresIn;
    }
    public int getExpiresIn() {
        return this.expiresIn;
    }
}
