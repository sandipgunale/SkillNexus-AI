package com.careermetric.job.service;

import com.careermetric.job.dto.SkillGap;
import com.careermetric.job.entity.JobRequirement;

public interface SkillGapIntelligenceService {

    SkillGap createSkillGap(JobRequirement requirement);
}