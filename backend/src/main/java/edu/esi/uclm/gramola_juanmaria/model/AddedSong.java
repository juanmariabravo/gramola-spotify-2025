package edu.esi.uclm.gramola_juanmaria.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class AddedSong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-incremental ID
    private Long id;
    private String trackId;
    @ManyToOne // muchos AddedSong pueden pertenecer a un mismo User
    @JoinColumn(name = "user_email", referencedColumnName = "email")
    private User user;

    public AddedSong() {
    }

    public AddedSong(String trackId, User user) {
        this.trackId = trackId;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTrackId() {
        return trackId;
    }

    public void setTrackId(String trackId) {
        this.trackId = trackId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

}
