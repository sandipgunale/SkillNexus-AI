package com.careermetric.ai.dto;

import java.util.List;

public record ResumeRecommendationAiResult(
        List<ResumeRecommendation> recommendations
) {
}