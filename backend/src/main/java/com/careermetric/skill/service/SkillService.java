package com.careermetric.skill.service;

import com.careermetric.skill.dto.SkillDashboardResponse;
import com.careermetric.skill.dto.SkillResponse;

import java.util.List;

public interface SkillService {

    List<SkillResponse> getMySkills();

    SkillResponse getMySkill(Long technologyId);

    SkillDashboardResponse getMySkillDashboard();
}