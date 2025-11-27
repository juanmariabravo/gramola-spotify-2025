/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package edu.esi.uclm.gramola_juanmaria.model;

import edu.esi.uclm.gramola_juanmaria.util.PasswordEncryptor;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

@Entity
public class User {
    @Id // para que JPA sepa que email es la clave primaria
    private String email;
    private String barName;
    private String songPrice;
    private String pwd;
    private String clientId;
    private String clientSecret;
    private String gramolaCookie;
    private boolean confirmed = false; // si el usuario ha confirmado su email
    @Column(columnDefinition = "TEXT") // Imagen codificada en base64 (puede ser muy grande, hasta 65KB)
    private String signature;
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "creation_token_id", referencedColumnName = "id", nullable = false)
    private Token creationToken; // token de confirmación

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER, optional = true)
    @JoinColumn(name = "recovery_token_id", referencedColumnName = "id", nullable = true)
    private Token recoveryToken; // token de recuperación de contraseña

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEmail() {
        return this.email;
    }

    /* Mejor encriptar la contraseña aquí. Cifrado irreversible */
    public void setPwd(String pwd) {
        this.pwd = PasswordEncryptor.encrypt(pwd);
    }

    public String getPwd() {
        return this.pwd;
    }

    public void setCreationToken(Token token) {
        this.creationToken = token;
    }

    public Token getCreationToken() {
        return this.creationToken;
    }

    public void setRecoveryToken(Token token) {
        this.recoveryToken = token;
    }

    public Token getRecoveryToken() {
        return this.recoveryToken;
    }

    public void setConfirmed(boolean b) {
        this.confirmed = b;
    }

    public boolean isConfirmed() {
        return this.confirmed;
    }

    public String getBarName() {
        return barName;
    }

    public void setBarName(String barName) {
        this.barName = barName;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }

    public String getSongPrice() {
        return songPrice;
    }

    public void setSongPrice(String songPrice) {
        this.songPrice = songPrice;
    }

    public String getGramolaCookie() {
        return gramolaCookie;
    }

    public void setGramolaCookie(String gramolaCookie) {
        this.gramolaCookie = gramolaCookie;
    }
}
