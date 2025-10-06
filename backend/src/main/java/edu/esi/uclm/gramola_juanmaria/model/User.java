/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package edu.esi.uclm.gramola_juanmaria.model;

import edu.esi.uclm.gramola_juanmaria.util.PasswordEncryptor;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Transient;

@Entity
public class User {
    @Id // para que JPA sepa que email es la clave primaria
    private String email;
    private String pwd;
    // @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    // @JoinColumn(name = "creation_token_id")
    @Transient // para que el token no se guarde en la base de datos (de momento)
    private Token creationToken; // token de confirmación
    private boolean confirmed = false; // si el usuario ha confirmado su email

    public void setEmail(String email) {
        this.email = email;
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

}
