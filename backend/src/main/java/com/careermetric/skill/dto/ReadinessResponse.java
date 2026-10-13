package com.careermetric.skill.dto;

public record ReadinessResponse(
        int readinessScore,
        int trackedSkills,
        String readinessLevel
) {
}