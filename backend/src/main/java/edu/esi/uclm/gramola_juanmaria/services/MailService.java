package edu.esi.uclm.gramola_juanmaria.services;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;


@Service
public class MailService {

    @Autowired
    private JavaMailSender emailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    @org.springframework.beans.factory.annotation.Value("${mail.template.confirmacion}")
    private String confirmacionTemplate;

    @org.springframework.beans.factory.annotation.Value("${mail.template.recuperacion}")
    private String recuperacionTemplate;

    public void sendConfirmationEmail(String to, String nombre, String enlace) {
        String template = loadTemplate(confirmacionTemplate);
        if (template != null) {
            String body = template.replace("%NOMBRE%", nombre).replace("%ENLACE%", enlace);
            sendEmail(to, "Confirmación de cuenta - Gramola", body);
        }
        else {
            System.out.println("No se pudo cargar la plantilla de correo electrónico de confirmación.");
        }
    }

    public void sendRecoveryEmail(String to, String nombre, String enlace) {
        String template = loadTemplate(recuperacionTemplate);
        if (template != null) {
            String body = template.replace("%NOMBRE%", nombre).replace("%ENLACE%", enlace);
            sendEmail(to, "Recuperación de contraseña - Gramola", body);
        }
        else {
            System.out.println("No se pudo cargar la plantilla de correo electrónico de recuperación.");
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
        }
    }

    private String loadTemplate(String filename) {
        try {
            ClassPathResource resource = new ClassPathResource(filename);
            return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            return null;
        }
    }
}
