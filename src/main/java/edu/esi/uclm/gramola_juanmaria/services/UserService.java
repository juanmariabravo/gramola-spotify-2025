package edu.esi.uclm.gramola_juanmaria.services;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import edu.esi.uclm.gramola_juanmaria.model.Token;
import edu.esi.uclm.gramola_juanmaria.model.User;
import edu.esi.uclm.gramola_juanmaria.util.PasswordEncryptor;

@Service // Si quitamos esta anotación, no se podría inyectar el servicio en el controlador
public class UserService {

    private Map<String, User> users = new HashMap<>(); // email -> User // de momento lo guardamos en una colección en memoria

    public void register(String email, String pwd) {
        if (this.users.containsKey(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está registrado");
        }
        // si no existe el email, lo creamos y guardamos
        User user = new User();
        user.setEmail(email);
        user.setPwd(pwd); // Guardar la contraseña (el método setPwd la encripta)
        user.setCreationToken(new Token()); // generar un token nuevo
        users.put(email, user); // guardar en la colección con key=email y value=User

        System.out.println("http://localhost:8080/users/confirmToken/" + email + "?token=" + user.getCreationToken().getId());
        // Este sería el enlace que se enviaría por email
    }

    public void login(String email, String pwd) {
        if (!this.users.containsKey(email)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El email no está registrado");
        }
        User user = this.users.get(email);
        
        // Verificar la contraseña encriptando la entrada y comparando
        String encryptedInputPassword = PasswordEncryptor.encrypt(pwd);
        if (!encryptedInputPassword.equals(user.getPwd())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contraseña incorrecta");
        }

        System.out.println("Usuario " + email + " ha hecho login correctamente");
    }
    
    public void delete(String email) {
        if (!this.users.containsKey(email)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El email no está registrado");
        }
        this.users.remove(email);

        System.out.println("Usuario " + email + " ha sido eliminado");
    }

    public void confirmToken(String email, String token) {
        User user = this.users.get(email);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El email no está registrado");
        }

        Token userToken = user.getCreationToken();
        
        if (!userToken.getId().equals(token)) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Token incorrecto");
        }

        if (userToken.getCreationTime() < System.currentTimeMillis()-30 * 60 * 1000) { // 30 minutos
            throw new ResponseStatusException(HttpStatus.GONE, "El token ha expirado");
        }

        if (userToken.isUsed()) {
            throw new ResponseStatusException(HttpStatus.GONE, "El token ya ha sido usado");
        }

        userToken.use(); // marcar el token como usado
    }
}
