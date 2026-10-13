package com.careermetric.skill.dto;

public record PreparationPlanItemResponse(
        Long id,
        Long technologyId,
        String technologyName,
        String skill,
        String priority,
        String description,
        String status
) {
}