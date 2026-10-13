package com.careermetric.skill.service;

import com.careermetric.skill.dto.ReadinessResponse;
import com.careermetric.skill.dto.SkillProgressResponse;

import java.util.List;

public interface SkillProgressService {

    List<SkillProgressResponse> getCurrentUserProgress();

    SkillProgressResponse getCurrentUserProgressForTechnology(
            Long technologyId
    );

    SkillProgressResponse recalculateProgress(
            Long technologyId
    );

    ReadinessResponse getCurrentUserReadiness();
}