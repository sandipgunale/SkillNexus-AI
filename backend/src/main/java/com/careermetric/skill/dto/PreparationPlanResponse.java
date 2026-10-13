package com.careermetric.skill.dto;

import java.util.List;

public record PreparationPlanResponse(
        Long id,
        String title,
        String description,
        String status,
        List<PreparationPlanItemResponse> items
) {
}