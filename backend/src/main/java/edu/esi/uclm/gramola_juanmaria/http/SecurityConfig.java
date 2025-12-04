package edu.esi.uclm.gramola_juanmaria.http;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // @Bean
    // SecurityFilterChain securityFilter(HttpSecurity http) throws Exception {
    //     http
    //             .csrf().disable()
    //             .authorizeHttpRequests()
    //             .requestMatchers("/**")
    //             .permitAll();
    //     DefaultSecurityFilterChain filterChain = http.build();
    //     return filterChain;
    // }
    @Bean
    SecurityFilterChain securityFilter(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Desactivar CSRF (Cross-Site Request Forgery). 
                //                              CSRF es una protección contra ataques que intentan 
                //                              hacer peticiones maliciosas utilizando las cookies de sesión
                //                              que se han quedado en el navegador del usuario.
                //
                //                              Lo desactivamos porque aquí no hay riesgo de CSRF
                .authorizeHttpRequests(
                        auth -> auth
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                .requestMatchers("/users/login", "/users/register", "/users/recover-password",
                                        "/users/reset-password", "/users/validate-reset-token",
                                        "/users/confirm/**", "/payments/**").permitAll()
                                .anyRequest().authenticated() // Todas las demás peticiones requieren autenticación
                )
                .httpBasic(Customizer.withDefaults()); // Habilitar autenticación con HTTP Basic

        DefaultSecurityFilterChain filterChain = http.build();
        return filterChain;

    }
}
