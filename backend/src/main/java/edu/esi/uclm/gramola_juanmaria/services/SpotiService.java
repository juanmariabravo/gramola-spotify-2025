package edu.esi.uclm.gramola_juanmaria.services;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import edu.esi.uclm.gramola_juanmaria.dao.UserDao;
import edu.esi.uclm.gramola_juanmaria.model.SpotiToken;
import edu.esi.uclm.gramola_juanmaria.model.User;

@Service
public class SpotiService {

    @Autowired
    UserDao userDao;

    @Autowired
    UserService userService;

    RestClient restClient = RestClient.create();

    private final String tokenUrl = "https://accounts.spotify.com/api/token";

    public String getClientId(String email) {
        Optional<User> optUser = this.userDao.findById(email);
        if (optUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El email no está registrado");
        }
        User user = optUser.get();
        return user.getClientId();
    }


    public SpotiToken getAuthorizationToken(String code, String clientId) {
        User user = this.userService.getUserByClientId(clientId);
        String clientSecret = user.getClientSecret();

        // Llamar a SpotiAPI para obtener el token de autorización
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("grant_type", "authorization_code");
        form.add("redirect_uri", "http://127.0.0.1:4200/callback");

        // Realizar la solicitud a la API de Spotify
        String header = this.basicAuth(clientId, clientSecret);

        String url = this.tokenUrl;
        SpotiToken token = restClient.post()
            .uri(url)
            .header(HttpHeaders.AUTHORIZATION, header)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(form)
            .retrieve()
            .body(SpotiToken.class);
            return token;
        }

    private String basicAuth(String clientId, String clientSecret) {
        String pairs = clientId + ":" + clientSecret;
        String encoded = Base64.getEncoder().encodeToString(pairs.getBytes(StandardCharsets.UTF_8));
        return "Basic " + encoded;
    }

}
