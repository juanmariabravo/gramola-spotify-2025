package edu.esi.uclm.gramola_juanmaria.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.esi.uclm.gramola_juanmaria.model.User;

@Repository // para que Spring sepa que: la clave principal es String (email) y la entidad es User
public interface UserDao extends JpaRepository<User, String> {
    
}
