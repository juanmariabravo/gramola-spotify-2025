package edu.esi.uclm.gramola_juanmaria.services;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import edu.esi.uclm.gramola_juanmaria.dao.UserDao;
import edu.esi.uclm.gramola_juanmaria.model.Token;
import edu.esi.uclm.gramola_juanmaria.model.User;
import edu.esi.uclm.gramola_juanmaria.util.PasswordEncryptor;

@Service // Si quitamos esta anotación, no se podría inyectar el servicio en el controlador
public class UserService {

    
    @Autowired
    UserDao userDao;

    public void register(String barName, String email, String pwd, String client_id, String client_secret) {
        Optional<User> optUser = this.userDao.findById(email); // Optional<User> es una caja que puede contener un User o no. Hasta que no mires dentro, no sabes si está o no.
        if (optUser.isEmpty()) {
            // El email no está registrado, podemos crear el usuario
            User user = new User();
            user.setBarName(barName);
            user.setEmail(email);
            user.setPwd(pwd); // Encriptar la contraseña antes de guardarla
            System.out.println("Password :" + user.getPwd());
            user.setClientId(client_id);
            user.setClientSecret(client_secret);
            user.setCreationToken(new Token()); // Crear un token de confirmación
            this.userDao.save(user); // Guardar en la base de datos

            // Devolver el token de confirmación
            // (code_profesor) return user.getCreationToken().getId();
            System.out.println("Usuario " + email + " registrado correctamente");
            // Se enviaría un email con el token de confirmación, pero de momento imprimimos aquí el link
            String base = "http://localhost:8080";
            String confirmUrl = String.format("%s/users/confirm/%s?token=%s",
                base,
                URLEncoder.encode(email, StandardCharsets.UTF_8),
                URLEncoder.encode(user.getCreationToken().getId(), StandardCharsets.UTF_8)
            );
            System.out.println(confirmUrl);
        } else {
            // El email ya está registrado
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está registrado");
        }
    }

    public String login(String email, String pwd) {
        Optional<User> optUser = this.userDao.findById(email); // Optional<User> es una caja que puede contener un User o no. Hasta que no mires dentro, no sabes si está o no.
        if (optUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El email no está registrado");
        }
        User user = optUser.get(); // Sacar el User de la caja Optional
        if (!user.isConfirmed()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El email no ha sido confirmado");
        }

        // Verificar la contraseña encriptando la entrada y comparando
        String encryptedInputPassword = PasswordEncryptor.encrypt(pwd);
        if (!encryptedInputPassword.equals(user.getPwd())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contraseña incorrecta");
        }

        System.out.println("Usuario " + email + " ha hecho login correctamente");
        // Devolver clientId (puede ser null si no existe)
        return user.getClientId();
    }
    
    public void delete(String email) {
        Optional<User> optUser = this.userDao.findById(email);
        if (optUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El email no está registrado");
        }
        this.userDao.deleteById(email);
        System.out.println("Usuario " + email + " borrado correctamente");
    }

    public User getUserByClientId(String clientId) {
        // Usamos findTopByClientId para evitar excepciones si la base de datos contiene accidentalmente
        // múltiples filas con el mismo clientId. Devolverá el primero encontrado.
        Optional<User> optUser = this.userDao.findTopByClientId(clientId);
        if (optUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "ClientId no registrado");
        }
        // NOTA: es recomendable limpiar duplicados en la BD y aplicar una restricción UNIQUE sobre clientId.
        return optUser.get();
    }

    public void confirmToken(String email, String token) {

        Optional<User> optUser = this.userDao.findById(email);
        if (optUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El email no está registrado");
        }

        if (optUser.get().isConfirmed()) {
            System.out.println("Usuario " + email + " ya está confirmado");
            return;
        }

        User user = optUser.get(); // Sacar el User de la caja Optionals
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

        user.setConfirmed(true); // marcar el usuario como confirmado
        this.userDao.save(user); // guardar los cambios en la base de datos
        System.out.println("Usuario " + email + " ha confirmado su email correctamente");
    }
}
