package com.careermetric.ai.dto;

public record ResumeRecommendation(
        String category,
        String priority,
        String recommendation,
        String reason,
        String action
) {
}