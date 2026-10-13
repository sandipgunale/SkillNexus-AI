package com.careermetric.skill.dto;

public record SkillProgressResponse(
        Long technologyId,
        String technologyName,
        Integer assessmentScore,
        Integer interviewScore,
        Integer overallScore
) {
}