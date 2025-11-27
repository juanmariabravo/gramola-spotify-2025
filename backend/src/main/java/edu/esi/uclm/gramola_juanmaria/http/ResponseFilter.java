package edu.esi.uclm.gramola_juanmaria.http;

import java.io.IOException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;

import edu.esi.uclm.gramola_juanmaria.model.User;
import edu.esi.uclm.gramola_juanmaria.dao.UserDao;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class ResponseFilter extends OncePerRequestFilter {

    @Autowired
    private UserDao userDao;

    /*
     * Las peticiones públicas no requieren autenticación.
     * El resto de peticiones deberán tener autenticación (cookie de sesión válida)
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String resource = request.getRequestURI();

        // Rutas públicas que NO requieren autenticación
        return resource.equals("/users/login")
                || resource.equals("/users/register")
                || resource.equals("/users/recover-password")
                || resource.equals("/users/reset-password")
                || resource.equals("/users/validate-reset-token")
                || resource.startsWith("/users/confirm/") // Confirmación de email
                || resource.startsWith("/payments"); // Pagos (por ahora públicos)
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        // Cuando me llegue una petición que deba ser filtrada, busco la cookie de
        // autenticación

        Cookie[] cookies = request.getCookies();
        Cookie gramolaCookie = null;
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("gramolaCookie")) {
                    gramolaCookie = cookie;
                    break;
                }
            }
        }

        if (gramolaCookie == null || gramolaCookie.getValue() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autenticado - cookie no encontrada");
        }

        Optional<User> opt_user = userDao.findByGramolaCookie(gramolaCookie.getValue());
        if (opt_user.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autenticado - cookie inválida");
        }

        // Guardar el usuario en el request para que los controladores puedan acceder a
        // él
        request.setAttribute("user", opt_user.get());

        filterChain.doFilter(request, response);
    }
}
