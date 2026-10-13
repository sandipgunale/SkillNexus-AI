package com.careermetric.skill.repository;

import com.careermetric.skill.entity.PreparationPlan;
import com.careermetric.skill.entity.PreparationPlanStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PreparationPlanRepository
        extends JpaRepository<PreparationPlan, Long> {

    List<PreparationPlan> findAllByUserId(Long userId);

    Optional<PreparationPlan> findByIdAndUserId(
            Long planId,
            Long userId
    );

    Optional<PreparationPlan>
    findFirstByUserIdAndStatusOrderByCreatedAtDesc(
            Long userId,
            PreparationPlanStatus status
    );

    Optional<PreparationPlan>
    findFirstByUserIdOrderByCreatedAtDesc(
            Long userId
    );
}