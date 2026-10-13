package com.careermetric.skill.service;

import com.careermetric.skill.dto.CreatePreparationPlanRequest;
import com.careermetric.skill.dto.PreparationPlanResponse;
import com.careermetric.skill.dto.UpdatePreparationItemStatusRequest;

import java.util.List;

public interface PreparationPlanService {

    PreparationPlanResponse createPlan(
            CreatePreparationPlanRequest request
    );

    List<PreparationPlanResponse> getCurrentUserPlans();

    PreparationPlanResponse getCurrentUserPlan(Long planId);

    PreparationPlanResponse activatePlan(Long planId);

    PreparationPlanResponse updateItemStatus(
            Long planId,
            Long itemId,
            UpdatePreparationItemStatusRequest request
    );

    PreparationPlanResponse generatePlanFromJobMatch(
            Long resumeId,
            Long jobDescriptionId
    );
}