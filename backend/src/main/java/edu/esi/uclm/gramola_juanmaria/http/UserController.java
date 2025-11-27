package edu.esi.uclm.gramola_juanmaria.http;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import edu.esi.uclm.gramola_juanmaria.model.User;
import edu.esi.uclm.gramola_juanmaria.services.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("users")
public class UserController {

    @Autowired
    private UserService service; // Spring se encarga de instanciar el objeto ya que UserService es un @Service

    /*
     * register es un servicio web que recibe un JSON con email, pwd1 y pwd2,
     * barName, client_id, client_secret y signature (firma del propietario
     * codificada en Base64)
     */
    @PostMapping("/register") // podríamos especificar: (value="/register", consumes="application/json")
    public void register(@RequestBody Map<String, String> body) {
        String barName = body.get("barName");
        String email = body.get("email");
        String pwd1 = body.get("pwd1");
        String pwd2 = body.get("pwd2");
        String client_id = body.get("clientId");
        String client_secret = body.get("clientSecret");
        String signature = body.get("signature");
        if (email == null || pwd1 == null || pwd2 == null || barName == null || client_id == null
                || client_secret == null || signature == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faltan parámetros");
        }

        if (!pwd1.equals(pwd2)) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Las contraseñas no coinciden");
        }

        if (pwd1.length() < 8) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE,
                    "La contraseña debe tener al menos 8 caracteres");
        }

        if (!email.contains("@") || !email.contains(".")) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Email inválido");
        }

        this.service.register(barName, email, pwd1, client_id, client_secret, signature);
    }

    /* login es un servicio web que recibe un JSON con email y pwd */
    @PostMapping("/login")
    public Map<String, String> login(HttpServletResponse response, @RequestBody Map<String, String> body) {
        String email = body.get("email");
        String pwd = body.get("password");
        if (email == null || pwd == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faltan parámetros");
        }

        if (!email.contains("@") || !email.contains(".")) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Email inválido");
        }

        // Autenticar usuario
        User user = service.login(email, pwd);

        // Crear cookie y guardarla en la base de datos
        String cookieValue = UUID.randomUUID().toString();
        Cookie gramolaCookie = new Cookie("gramolaCookie", cookieValue);
        gramolaCookie.setPath("/");
        gramolaCookie.setHttpOnly(true);
        gramolaCookie.setMaxAge(7 * 24 * 60 * 60); // 7 días
        // gramolaCookie.setSecure(true); // requiere HTTPS
        // gramolaCookie.setAttribute("SameSite", "Strict");
        response.addCookie(gramolaCookie);

        // Guardar el valor de la cookie en el usuario
        service.updateGramolaCookie(user.getEmail(), cookieValue);

        // Devuelve Map con client_id y user_token
        return Map.of(
                "client_id", user.getClientId() != null ? user.getClientId() : "",
                "user_token", user.getCreationToken() != null ? user.getCreationToken().getId() : "");
    }

    /* logout - invalida la cookie de sesión */
    @PostMapping("/logout")
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        User user = (User) request.getAttribute("user");

        // Invalidar la cookie en la base de datos
        service.updateGramolaCookie(user.getEmail(), null);

        // Eliminar la cookie del navegador
        Cookie gramolaCookie = new Cookie("gramolaCookie", "");
        gramolaCookie.setPath("/");
        gramolaCookie.setHttpOnly(true);
        gramolaCookie.setMaxAge(0); // Eliminar inmediatamente
        response.addCookie(gramolaCookie);
    }

    /* delete - elimina la cuenta del usuario autenticado */
    @DeleteMapping("/delete")
    public void delete(HttpServletRequest request, HttpServletResponse response, @RequestParam String email) {
        User user = (User) request.getAttribute("user");

        if (!user.getEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para eliminar esta cuenta");
        }
        // Eliminar el usuario
        this.service.delete(email);

        // Eliminar la cookie del navegador
        Cookie gramolaCookie = new Cookie("gramolaCookie", "");
        gramolaCookie.setPath("/");
        gramolaCookie.setHttpOnly(true);
        gramolaCookie.setMaxAge(0);
        response.addCookie(gramolaCookie);
    }

    @PostMapping("/recover-password")
    public void recoverPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email es requerido");
        }
        if (!email.contains("@") || !email.contains(".")) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Email inválido");
        }
        this.service.recoverPassword(email);
    }

    @GetMapping("/validate-reset-token")
    public void validateResetToken(@RequestParam String email, @RequestParam String token) {
        this.service.validateResetToken(email, token);
    }

    @GetMapping("/me")
    public Map<String, Object> getCurrentUser(HttpServletRequest request) {
        User user = (User) request.getAttribute("user");
        return Map.of(
                "email", user.getEmail(),
                "barName", user.getBarName() != null ? user.getBarName() : "",
                "clientId", user.getClientId() != null ? user.getClientId() : "",
                "signature", user.getSignature() != null ? user.getSignature() : "",
                "songPrice", user.getSongPrice() != null ? user.getSongPrice() : "50");
    }

    @PostMapping("/reset-password")
    public void resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String token = body.get("token");
        String newPassword = body.get("newPassword");

        if (email == null || token == null || newPassword == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faltan parámetros requeridos");
        }

        this.service.resetPassword(email, token, newPassword);
    }

    @GetMapping("/confirm/{email}")
    public void confirmToken(@PathVariable String email, @RequestParam String token, HttpServletResponse response)
            throws IOException {
        // Solo validamos el token (no lo marcamos como usado ni confirmamos al usuario
        // aún)
        this.service.validateToken(email, token);
        // Redirigir a la página de pago - la confirmación real ocurrirá después del
        // pago exitoso
        String frontBase = ConfigurationLoader.get().getJsonConfig().getJSONObject("urls").getString("frontend_base");
        String suscription_amount = ConfigurationLoader.get().getJsonConfig().getJSONObject("stripe")
                .getString("suscription_price");
        response.sendRedirect(frontBase + "/payments?token=" + token + "&amount=" + suscription_amount);
    }

    @PutMapping("/update-barname")
    public void updateBarName(HttpServletRequest request, @RequestBody Map<String, String> body) {
        User user = (User) request.getAttribute("user");
        String barName = body.get("barName");
        this.service.updateBarName(user.getEmail(), barName);
    }

    @PutMapping("/update-songprice")
    public void updateSongPrice(HttpServletRequest request, @RequestBody Map<String, String> body) {
        User user = (User) request.getAttribute("user");
        String songPrice = body.get("songPrice");
        this.service.updateSongPrice(user.getEmail(), songPrice);
    }

    @PutMapping("/change-password")
    public void changePassword(HttpServletRequest request, @RequestBody Map<String, String> body) {
        User user = (User) request.getAttribute("user");
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");
        this.service.changePassword(user.getEmail(), currentPassword, newPassword);
    }
}