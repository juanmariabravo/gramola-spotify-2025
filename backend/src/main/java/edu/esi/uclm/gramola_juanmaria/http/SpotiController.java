package edu.esi.uclm.gramola_juanmaria.http;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import edu.esi.uclm.gramola_juanmaria.model.SpotiToken;
import edu.esi.uclm.gramola_juanmaria.services.SpotiService;

@RestController
@RequestMapping("spoti") // 
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"}) // permitir llamadas desde el frontend en Angular
public class SpotiController {

    @Autowired
    private SpotiService spotiService;

    @GetMapping("/getClientId")
    public String getClientId(@RequestParam String email) {
        return this.spotiService.getClientId(email);
    }

    @GetMapping("/getAuthorizationToken")
    public SpotiToken getAuthorizationToken(@RequestParam String code, @RequestParam String clientId) {
        SpotiToken token = this.spotiService.getAuthorizationToken(code, clientId);
        return token;
    }

}
