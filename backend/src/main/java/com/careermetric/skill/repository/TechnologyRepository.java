package com.careermetric.skill.repository;

import com.careermetric.skill.entity.Technology;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TechnologyRepository
        extends JpaRepository<Technology, Long> {

    Optional<Technology> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}