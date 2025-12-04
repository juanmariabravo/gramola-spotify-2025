package edu.esi.uclm.gramola_juanmaria.services;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import edu.esi.uclm.gramola_juanmaria.dao.UserDao;
import edu.esi.uclm.gramola_juanmaria.http.ConfigurationLoader;
import edu.esi.uclm.gramola_juanmaria.model.Token;
import edu.esi.uclm.gramola_juanmaria.model.User;
import edu.esi.uclm.gramola_juanmaria.util.PasswordEncryptor;

@Service // Si quitamos esta anotación, no se podría inyectar el servicio en el controlador
public class UserService {

    
    @Autowired
    UserDao userDao;

    @Autowired
    MailService mailService;

    public void register(String barName, String email, String pwd, String client_id, String client_secret, String signature) {
        Optional<User> optUser = this.userDao.findById(email); // Optional<User> es una caja que puede contener un User o no. Hasta que no mires dentro, no sabes si está o no.
        if (optUser.isEmpty()) {
            // El email no está registrado, podemos crear el usuario
            User user = new User();
            user.setBarName(barName);
            user.setEmail(email);
            user.setPwd(pwd); // Encriptar la contraseña antes de guardarla
            //System.out.println("Password :" + user.getPwd());
            user.setClientId(client_id);
            user.setClientSecret(client_secret);
            user.setCreationToken(new Token()); // Crear un token de confirmación
            user.setSignature(signature);
            this.userDao.save(user); // Guardar en la base de datos

            // Devolver el token de confirmación
            // (code_profesor) return user.getCreationToken().getId();
            System.out.println("Usuario " + email + " registrado correctamente");
            // Se enviaría un email con el token de confirmación, pero de momento imprimimos aquí el link
            String base = ConfigurationLoader.get().getJsonConfig().getJSONObject("urls").getString("backend_base");
            String confirmUrl = String.format("%s/users/confirm/%s?token=%s",
                base,
                URLEncoder.encode(email, StandardCharsets.UTF_8),
                URLEncoder.encode(user.getCreationToken().getId(), StandardCharsets.UTF_8)
            );
            mailService.sendConfirmationEmail(email, barName, confirmUrl);
        } else {
            // El email ya está registrado
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está registrado");
        }
    }

    public User login(String email, String pwd) {
        Optional<User> optUser = this.userDao.findById(email); // Optional<User> es una caja que puede contener un User o no. Hasta que no mires dentro, no sabes si está o no.
        if (optUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El email no está registrado");
        }
        User user = optUser.get(); // Sacar el User de la caja Optional
        if (!user.isConfirmed()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El email no ha sido confirmado. Por favor, revisa el enlace enviado por email y activa tu cuenta.");
        }

        // Verificar la contraseña encriptando la entrada y comparando
        String encryptedInputPassword = PasswordEncryptor.encrypt(pwd);
        if (!encryptedInputPassword.equals(user.getPwd())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contraseña incorrecta");
        }

        System.out.println("Usuario " + email + " ha hecho login correctamente");

        return user;
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

    public User getUserByEmail(String email) {
        Optional<User> optUser = this.userDao.findById(email);
        if (optUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El email no está registrado");
        }
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
    }

    // Valida el token sin marcarlo como usado ni confirmar al usuario (para usar antes del pago)
    public void validateToken(String email, String token) {
        Optional<User> optUser = this.userDao.findById(email);
        if (optUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El email no está registrado");
        }

        if (optUser.get().isConfirmed()) {
            System.out.println("Usuario " + email + " ya está confirmado");
            return;
        }

        User user = optUser.get();
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

        // System.out.println("Token validado correctamente para usuario " + email + " - pendiente de pago");
    }

    public void recoverPassword(String email) {
        Optional<User> optUser = this.userDao.findById(email);
        if (optUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El email no está registrado");
        }

        User user = optUser.get();
        
        // Crear un nuevo token de recuperación
        Token recoveryToken = new Token();
        user.setRecoveryToken(recoveryToken);
        this.userDao.save(user);

        // Construir URL de recuperación
        String base = ConfigurationLoader.get().getJsonConfig().getJSONObject("urls").getString("frontend_base");
        String recoveryUrl = String.format("%s/reset-password?email=%s&token=%s",
            base,
            URLEncoder.encode(email, StandardCharsets.UTF_8),
            URLEncoder.encode(recoveryToken.getId(), StandardCharsets.UTF_8)
        );

        mailService.sendRecoveryEmail(email, user.getBarName(), recoveryUrl);
    }

    public void validateResetToken(String email, String token) {
        Optional<User> optUser = this.userDao.findById(email);
        if (optUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El email no está registrado");
        }

        User user = optUser.get();
        Token recoveryToken = user.getRecoveryToken();
        
        if (recoveryToken == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No existe token de recuperación para este usuario");
        }
        
        if (!recoveryToken.getId().equals(token)) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Token incorrecto");
        }

        if (recoveryToken.getCreationTime() < System.currentTimeMillis() - 30 * 60 * 1000) { // 30 minutos
            throw new ResponseStatusException(HttpStatus.GONE, "El token ha expirado");
        }

        if (recoveryToken.isUsed()) {
            throw new ResponseStatusException(HttpStatus.GONE, "El token ya ha sido usado");
        }

        System.out.println("Token de recuperación validado correctamente para usuario " + email);
    }

    public void resetPassword(String email, String token, String newPassword) {
        // Primero validar el token
        validateResetToken(email, token);
        
        Optional<User> optUser = this.userDao.findById(email);
        User user = optUser.get(); // Ya validamos que existe en validateResetToken
        
        // Validar la nueva contraseña
        if (newPassword == null || newPassword.length() < 8) {
            throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "La contraseña debe tener al menos 8 caracteres");
        }
        
        // Actualizar la contraseña (setPwd encripta automáticamente)
        user.setPwd(newPassword);
        
        // Marcar el token de recuperación como usado
        user.getRecoveryToken().use();
        
        // Guardar cambios
        this.userDao.save(user);
        
        System.out.println("Contraseña actualizada correctamente para usuario " + email);
    }

    public void updateBarName(String email, String barName) {
        Optional<User> optUser = this.userDao.findById(email);
        if (optUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El email no está registrado");
        }
        User user = optUser.get();
        user.setBarName(barName);
        this.userDao.save(user);
        System.out.println("Nombre del bar actualizado correctamente para usuario " + email);
    }

    public void updateSongPrice(String email, String songPrice) {
        Optional<User> optUser = this.userDao.findById(email);
        if (optUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El email no está registrado");
        }
        User user = optUser.get();
        user.setSongPrice(songPrice);
        this.userDao.save(user);
        System.out.println("Precio de la canción actualizado correctamente para usuario " + email);
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        Optional<User> optUser = this.userDao.findById(email);
        if (optUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El email no está registrado");
        }
        User user = optUser.get();
        if (!user.getPwd().equals(PasswordEncryptor.encrypt(currentPassword))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Contraseña incorrecta");
        }
        user.setPwd(newPassword);
        this.userDao.save(user);
        System.out.println("Contraseña actualizada correctamente para usuario " + email);
    }

    public void updateGramolaCookie(String email, String cookieValue) {
        Optional<User> optUser = this.userDao.findById(email);
        if (optUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El email no está registrado");
        }
        User user = optUser.get();
        user.setGramolaCookie(cookieValue);
        this.userDao.save(user);
        System.out.println("Cookie de sesión actualizada para usuario " + email);
    }
}
