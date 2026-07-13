package com.toh.hanoi.repository;

import com.toh.hanoi.model.UserAccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccountEntity, Long> {
    Optional<UserAccountEntity> findByUsername(String username);
    boolean existsByUsername(String username);
}
