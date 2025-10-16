package edu.esi.uclm.gramola_juanmaria.dao;

import edu.esi.uclm.gramola_juanmaria.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository // para que Spring sepa que: la clave principal es String (email) y la entidad es User
public interface UserDao extends JpaRepository<User, String> {

	java.util.Optional<User> findByClientId(String clientId);
    
	// Devuelve solo el primer usuario que coincida con clientId (evita excepción si hay duplicados)
	java.util.Optional<User> findTopByClientId(String clientId);
	
	java.util.Optional<User> findByCreationTokenId(String token);

	java.util.Optional<User> findByEmail(String email);
}
