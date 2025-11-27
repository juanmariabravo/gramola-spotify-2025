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
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("users")
public class UserController {

    @Autowired
    private UserService service; // Spring se encarga de instanciar el objeto ya que UserService es un @Service

    /* register es un servicio web que recibe un JSON con email, pwd1 y pwd2, barName, client_id, client_secret y signature (firma del propietario codificada en Base64) */
    @PostMapping("/register") // podríamos especificar: (value="/register", consumes="application/json")
    public void register(@RequestBody Map<String, String> body) {
        String barName = body.get("barName");
        String email = body.get("email");
        String pwd1 = body.get("pwd1");
        String pwd2 = body.get("pwd2");
        String client_id = body.get("clientId");
        String client_secret = body.get("clientSecret");
        String signature = body.get("signature");
        if (email == null || pwd1 == null || pwd2 == null || barName == null || client_id == null || client_secret == null || signature == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faltan parámetros");
        }

        if (!pwd1.equals(pwd2)) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Las contraseñas no coinciden");
        }

        if (pwd1.length() < 8) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "La contraseña debe tener al menos 8 caracteres");
        }

        if (!email.contains("@") || !email.contains(".")) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Email inválido");
        }

        this.service.register(barName, email, pwd1, client_id, client_secret, signature);
    }

    /* login es un servicio web que recibe un JSON con email y pwd */
    @PostMapping("/login")
    public Map<String, String> login(HttpServletResponse response, HttpSession session, @RequestBody Map<String, String> body) {
        String email = body.get("email");
        String pwd = body.get("password");
        if (email == null || pwd == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faltan parámetros");
        }

        if (!email.contains("@") || !email.contains(".")) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Email inválido");
        }

        // Cookie 
        Cookie gramolaCookie;
        gramolaCookie = new Cookie("gramola_session", UUID.randomUUID().toString());
        gramolaCookie.setPath("/");
        gramolaCookie.setHttpOnly(true);
        response.addCookie(gramolaCookie);

        // Devuelve Map con client_id y signature
        User user = service.login(email, pwd);
        session.setAttribute("user", user);
        return Map.of(
                "client_id", user.getClientId() != null ? user.getClientId() : "",
                "user_token", user.getCreationToken() != null ? user.getCreationToken().getId() : ""
        );
    }

    @DeleteMapping("/delete")
    public void delete(@RequestParam String email) { // con @RequestParam se indica que el parámetro viene en la URL (URL/users/delete?email=...)
        this.service.delete(email);
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
    public Map<String, Object> getCurrentUser(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No hay sesión activa");
        }

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
    public void confirmToken(@PathVariable String email, @RequestParam String token, HttpServletResponse response) throws IOException { // @PathVariable para email porque está en el path, @RequestParam para token porque está después del ?
        // Solo validamos el token (no lo marcamos como usado ni confirmamos al usuario aún)
        this.service.validateToken(email, token);
        // Redirigir a la página de pago - la confirmación real ocurrirá después del pago exitoso
        String frontBase = ConfigurationLoader.get().getJsonConfig().getJSONObject("urls").getString("frontend_base");
        String suscription_amount = ConfigurationLoader.get().getJsonConfig().getJSONObject("stripe").getString("suscription_price");
        response.sendRedirect(frontBase + "/payments?token=" + token + "&amount=" + suscription_amount);
    }

    @PutMapping("/update-barname")
    public void updateBarName(HttpSession session, @RequestBody Map<String, String> body) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No hay sesión activa");
        }

        String barName = body.get("barName");
        this.service.updateBarName(user.getEmail(), barName);

        // Actualizar el usuario en la sesión con los datos más recientes
        User updatedUser = this.service.getUserByEmail(user.getEmail());
        session.setAttribute("user", updatedUser);
    }

    @PutMapping("/update-songprice")
    public void updateSongPrice(HttpSession session, @RequestBody Map<String, String> body) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No hay sesión activa");
        }

        String songPrice = body.get("songPrice");
        this.service.updateSongPrice(user.getEmail(), songPrice);

        // Actualizar el usuario en la sesión con los datos más recientes
        User updatedUser = this.service.getUserByEmail(user.getEmail());
        session.setAttribute("user", updatedUser);
    }

    @PutMapping("/change-password")
    public void changePassword(HttpSession session, @RequestBody Map<String, String> body) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No hay sesión activa");
        }

        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");
        this.service.changePassword(user.getEmail(), currentPassword, newPassword);

        // Actualizar el usuario en la sesión con los datos más recientes
        User updatedUser = this.service.getUserByEmail(user.getEmail());
        session.setAttribute("user", updatedUser);
    }
}