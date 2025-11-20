package edu.esi.uclm.gramola_juanmaria.http;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import edu.esi.uclm.gramola_juanmaria.model.User;
import org.springframework.web.server.ResponseStatusException;

@Component
public class ResponseFilter extends OncePerRequestFilter {

    /* Las peticiones que vayan a /users están abiertas para todo el mundo
     * El resto de peticiones deberán tener autenticación (cookie de sesión válida)
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String resource = request.getRequestURI();
        return resource.startsWith("/users"); // si el recurso que está pidiendo empieza con /users, no aplicar el filtro
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        // Cuando me llegue una petición que deba ser filtrada, miro si en la sesión de la request hay un objeto de tipo User
        HttpSession session = request.getSession(false); // no crear sesión si no existe
        if (session == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autenticado - sesión no encontrada");
        }
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autenticado");
        }
        filterChain.doFilter(request, response);
    }
}
