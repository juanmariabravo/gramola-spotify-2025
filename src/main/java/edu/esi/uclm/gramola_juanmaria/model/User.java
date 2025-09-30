/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package edu.esi.uclm.gramola_juanmaria.model;

import edu.esi.uclm.gramola_juanmaria.util.PasswordEncryptor;

public class User {

    private String email;
    private String pwd;
    private Token token; // token de confirmación
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
        this.token = token;
    }

    public Token getCreationToken() {
        return this.token;
    }

    public void setConfirmed(boolean b) {
        this.confirmed = b;
    }

}
