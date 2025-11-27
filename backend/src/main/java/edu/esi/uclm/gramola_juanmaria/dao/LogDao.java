package edu.esi.uclm.gramola_juanmaria.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.esi.uclm.gramola_juanmaria.model.Log;

@Repository
public interface LogDao extends JpaRepository<Log, Long> {
}
