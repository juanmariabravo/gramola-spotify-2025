package edu.esi.uclm.gramola_juanmaria.model;

import java.util.Map;
import java.util.UUID;

import org.json.JSONObject;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class StripeTransaction {
    @Id @Column(length=36)
    private String id;

    @Column(columnDefinition = "json")
    private String data;

    private String email;

    public StripeTransaction() {
        this.id = UUID.randomUUID().toString();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Map<String, Object> getData() {
        return new JSONObject(this.data).toMap();
    }

    public void setData(Map<String, Object> data) {
        this.data = new JSONObject(data).toString();
    }

    public void setData(JSONObject data) {
        this.data = data.toString();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
