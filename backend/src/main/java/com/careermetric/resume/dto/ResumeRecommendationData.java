package com.careermetric.resume.dto;

public record ResumeRecommendationData(
        String category,
        String priority,
        String recommendation,
        String reason,
        String action
) {
}