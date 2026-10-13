package com.careermetric.ai.service;

import com.careermetric.ai.dto.ResumeAnalysisAiResult;
import com.careermetric.ai.dto.ResumeRecommendationAiResult;
import com.careermetric.ai.dto.TechnologyExtractionAiResult;

public interface ResumeRecommendationAiService {

    ResumeRecommendationAiResult generateRecommendations(
            String resumeText,
            ResumeAnalysisAiResult analysis,
            TechnologyExtractionAiResult technologyExtraction
    );
}