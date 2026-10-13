package com.careermetric.ai.service;

import com.careermetric.ai.dto.AssessmentQuestionAiResult;

public interface AssessmentQuestionAiService {

    AssessmentQuestionAiResult generateQuestions(
            String technologyName,
            String difficulty,
            int questionCount
    );
}