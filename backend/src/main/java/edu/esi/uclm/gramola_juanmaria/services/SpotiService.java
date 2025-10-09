package edu.esi.uclm.gramola_juanmaria.services;

import java.net.http.HttpHeaders;

public class SpotiService {
    
    public SpotiToken getAuthorizationToken(String code, String clientId) {
        User user = this.UserService.getUserByClientId(clientId);
        String clientSecret = user.getClientSecret();

        // Llamar a SpotiAPI para obtener el token de autorización
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("grant_type", "authorization_code");
        form.add("redirect_uri", "http://127.0.0.1:4200/callback");

        // Realizar la solicitud a la API de Spotify
        String header = this.basicAuth(clientId, clientSecret);

        String url = this.tokenUrl + "/api/token";
        SpotiToken token = restClient.post()
            .uri(url)
            .header(HttpHeaders.AUTHORIZATION, header)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(form)
            .retrieve()
            .body(SpotiToken.class);

            user.setSpotiSimpleToken(token);
            return token;
        }

    private String basicAuth(String clientId, String clientSecret) {
        String pairs = clientId + ":" + clientSecret;
        String encoded = Base64.getEncoder().encodeToString(pairs.getBytes());
        return "Basic " + encoded;
    }

}
