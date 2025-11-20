package edu.esi.uclm.gramola_juanmaria.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.esi.uclm.gramola_juanmaria.model.AddedSong;

@Repository
public interface AddedSongDao extends JpaRepository<AddedSong, Long> {
}
