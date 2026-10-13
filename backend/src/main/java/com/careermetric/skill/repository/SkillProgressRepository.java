package com.careermetric.skill.repository;

import com.careermetric.skill.entity.SkillProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkillProgressRepository
        extends JpaRepository<SkillProgress, Long> {

    List<SkillProgress> findAllByUserId(Long userId);

    Optional<SkillProgress> findByUserIdAndTechnologyId(
            Long userId,
            Long technologyId
    );

    boolean existsByUserIdAndTechnologyId(
            Long userId,
            Long technologyId
    );
}