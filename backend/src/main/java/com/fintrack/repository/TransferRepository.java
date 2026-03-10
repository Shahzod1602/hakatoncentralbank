package com.fintrack.repository;

import com.fintrack.entity.Transfer;
import com.fintrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, UUID> {
    List<Transfer> findByUserOrderByDateDescCreatedAtDesc(User user);
    Optional<Transfer> findByIdAndUser(UUID id, User user);
}
