package edu.esi.uclm.gramola_juanmaria.http;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.json.JSONObject;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

@Service
public class ConfigurationLoader {

    private static ConfigurationLoader instance;
    private JSONObject jsonConfig;

    private ConfigurationLoader() {
        ClassLoader classLoader = this.getClass().getClassLoader();
        try (InputStream fis = classLoader.getResourceAsStream("config.json")) {
            byte[] data = new byte[fis.available()];
            fis.read(data);
            String s = new String(data, StandardCharsets.UTF_8);
            this.jsonConfig = new JSONObject(s);
        } catch (IOException e) {
            throw new RuntimeException("Error loading configuration", e);
        }
    }

    @Bean
    public static ConfigurationLoader get() {
        if (instance == null) {
            instance = new ConfigurationLoader();
        }
        return instance;
    }

    public JSONObject getJsonConfig() {
        return this.jsonConfig;
    }
}
