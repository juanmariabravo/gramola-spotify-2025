
package edu.esi.uclm.gramola_juanmaria.services;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import edu.esi.uclm.gramola_juanmaria.model.User;

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
        user.setPwd(pwd);
        users.put(email, user); // guardar en la colección con key=email y value=User

        System.out.println("Registrando usuario: " + email + " con pwd: " + pwd);
    }

    public void login(String email, String pwd) {
        if (!this.users.containsKey(email)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El email no está registrado");
        }
        User user = this.users.get(email);
        if (!user.getPwd().equals(pwd)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contraseña incorrecta");
        }

        System.out.println("Usuario " + email + " ha hecho login con pwd: " + pwd);
    }

}
