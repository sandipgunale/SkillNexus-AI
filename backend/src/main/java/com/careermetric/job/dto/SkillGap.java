package com.careermetric.job.dto;

public record SkillGap(
        String skill,
        String type,
        String importance,
        String reason,
        java.util.List<String> resumeEvidence,
        java.util.List<String> suggestedPreparation
) {
}