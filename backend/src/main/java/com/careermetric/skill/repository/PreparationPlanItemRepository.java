package com.careermetric.skill.repository;

import com.careermetric.skill.entity.PreparationItemStatus;
import com.careermetric.skill.entity.PreparationPlanItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PreparationPlanItemRepository
        extends JpaRepository<PreparationPlanItem, Long> {

    List<PreparationPlanItem> findAllByPlanId(Long planId);

    Optional<PreparationPlanItem> findByIdAndPlanId(
            Long itemId,
            Long planId
    );

    List<PreparationPlanItem>
    findAllByPlanUserId(Long userId);

    List<PreparationPlanItem>
    findAllByPlanIdAndStatus(
            Long planId,
            PreparationItemStatus status
    );
}