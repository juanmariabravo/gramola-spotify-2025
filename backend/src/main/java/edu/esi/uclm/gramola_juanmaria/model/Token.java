package edu.esi.uclm.gramola_juanmaria.model;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity // Todas las clases que sean entidades deben tener un constructor sin parámetros al que llamará Spring
public class Token {
    @Id @Column(length = 36) // UUID tiene 36 caracteres
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

    public void setId(String id) {
        this.id = id;
    }

    public String getId() {
        return this.id;
    }

    public void setUseTime(long useTime) {
        this.useTime = useTime;
    }

    public long getUseTime() {
        return this.useTime;
    }

    public void setCreationTime(long creationTime) {
        this.creationTime = creationTime;
    }

    public long getCreationTime() {
        return this.creationTime;
    }

}
