package edu.esi.uclm.gramola_juanmaria.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.esi.uclm.gramola_juanmaria.model.StripeTransaction;

@Repository
public interface StripeTransactionDao extends JpaRepository<StripeTransaction, String> {
    List<StripeTransaction> findByEmailOrderByIdDesc(String email);
}