package com.careermetric.skill.dto;

import com.careermetric.skill.entity.TechnologyCategory;

import java.util.List;

public record SkillResponse(
        Long technologyId,
        String name,
        TechnologyCategory category,
        List<String> evidence
) {
}