package edu.esi.uclm.gramola_juanmaria.model;

import java.util.UUID;

public class Token {
    private String id;
    private long creationTime;
    private long useTime = 0; // tiempo en que se usó el token, 0 si no se ha usado aún

    public Token() {
        this.id = UUID.randomUUID().toString();
        this.creationTime = System.currentTimeMillis();
    }

    public void use() {
        this.useTime = System.currentTimeMillis();
    }

    public boolean isUsed() {
        return this.useTime != 0;
    }

    public String getId() {
        return this.id;
    }

    public long getCreationTime() {
        return this.creationTime;
    }
}
