package edu.esi.uclm.gramola_juanmaria.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Log {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT") // Indica que la columna puede contener textos largos
    private String url;

    private String ip;
    private String method;

    @Column(columnDefinition = "TEXT") // Indica que la columna puede contener textos largos
    private String userAgent;

    @Column(columnDefinition = "TEXT") // Indica que la columna puede contener textos largos
    private String params;

    private long time;

    public Log() {
    }

    public Log(String url, String ip, String method, String userAgent, String params, long time) {
        this.url = url;
        this.ip = ip;
        this.method = method;
        this.userAgent = userAgent;
        this.params = params;
        this.time = time;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getParams() {
        return params;
    }

    public void setParams(String params) {
        this.params = params;
    }

    public long getTime() {
        return time;
    }

    public void setTime(long time) {
        this.time = time;
    }
}
