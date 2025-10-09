/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package edu.esi.uclm.gramola_juanmaria.model;

import edu.esi.uclm.gramola_juanmaria.util.PasswordEncryptor;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

@Entity
public class User {
    @Id // para que JPA sepa que email es la clave primaria
    private String email;
    private String pwd;
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "creation_token_id", referencedColumnName = "id", nullable = false)
    private Token creationToken; // token de confirmación
    private boolean confirmed = false; // si el usuario ha confirmado su email

    // private String bar
    // private String gramola_cookie
    // private String clientId;
    // private String clientSecret;

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

    public void setConfirmed(boolean b) {
        this.confirmed = b;
    }

    public boolean isConfirmed() {
        return this.confirmed;
    }

}
