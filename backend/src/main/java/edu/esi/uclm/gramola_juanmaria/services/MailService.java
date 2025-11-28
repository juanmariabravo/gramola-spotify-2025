package edu.esi.uclm.gramola_juanmaria.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;


@Service
public class MailService {

    @Autowired
    private JavaMailSender emailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    public void sendConfirmationEmail(String to, String nombre, String enlace) {
        String template = loadTemplate("CorreoConfirmacion.html");
        if (template != null) {
            String body = template.replace("%NOMBRE%", nombre).replace("%ENLACE%", enlace);
            sendEmail(to, "Confirmación de cuenta - Gramola", body);
        }
    }

    public void sendRecoveryEmail(String to, String nombre, String enlace) {
        String template = loadTemplate("CorreoRecuperacion.html");
        if (template != null) {
            String body = template.replace("%NOMBRE%", nombre).replace("%ENLACE%", enlace);
            sendEmail(to, "Recuperación de contraseña - Gramola", body);
        }
    }

    private void sendEmail(String to, String subject, String text) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, true); // true indica que es HTML

            emailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    private String loadTemplate(String filename) {
        try {
            ClassPathResource resource = new ClassPathResource(filename);
            return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
