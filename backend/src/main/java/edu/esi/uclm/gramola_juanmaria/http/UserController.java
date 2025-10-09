package edu.esi.uclm.gramola_juanmaria.http;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import edu.esi.uclm.gramola_juanmaria.services.UserService;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("users")
public class UserController {

    @Autowired
    private UserService service; // Spring se encarga de instanciar el objeto ya que UserService es un @Service

    /* register es un servicio web que recibe un JSON con email, pwd1 y pwd2 */
    @CrossOrigin(origins = "http://localhost:4200") // permitir llamadas desde el frontend en Angular
    @PostMapping("/register") // podríamos especificar: (value="/register", consumes="application/json")
    public void register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String pwd1 = body.get("pwd1");
        String pwd2 = body.get("pwd2");

        if (!pwd1.equals(pwd2)) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Las contraseñas no coinciden");
        }

        if (pwd1.length() < 8) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "La contraseña debe tener al menos 8 caracteres");
        }

        if (!email.contains("@") || !email.contains(".")) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Email inválido");
        }

        this.service.register(email, pwd1);
    }

    /* login es un servicio web que recibe un JSON con email y pwd */
    @PostMapping("/login")
    public void login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String pwd = body.get("pwd");

        if (!email.contains("@") || !email.contains(".")) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Email inválido");
        }

        this.service.login(email, pwd);
    }

    @DeleteMapping("/delete")
    public void delete(@RequestParam String email) { // con @RequestParam se indica que el parámetro viene en la URL (URL/users/delete?email=...)
        this.service.delete(email);
    }

    @GetMapping("/confirmToken/{email}")
    public void confirmToken(@PathVariable String email, @RequestParam String token, HttpServletResponse response) { // throws IOException { // @PathVariable para email porque está en el path, @RequestParam para token porque está después del ?
        this.service.confirmToken(email, token);
        // response.sendRedirect("http://localhost:4200/payment?token=" + token); // redirigir a la página de pago
    }
}
