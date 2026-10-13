package com.careermetric.job.dto;

import java.util.List;

public record JobMatchResponse(
        Long resumeId,
        Long jobDescriptionId,
        int matchScore,
        List<String> matchedSkills,
        List<String> missingRequiredSkills,
        List<String> missingPreferredSkills,
        List<SkillGap> skillGaps
) {
}