package com.careermetric.skill.dto;

import com.careermetric.skill.entity.TechnologyCategory;

import java.util.List;
import java.util.Map;

public record SkillDashboardResponse(
        Integer totalSkills,
        Map<TechnologyCategory, Integer> categoryCounts,
        List<SkillResponse> skills
) {
}