package com.careermetric.ai.service;

import com.careermetric.ai.dto.InterviewEvaluationAiResult;
import com.careermetric.ai.dto.InterviewQuestionAiResult;

public interface InterviewAiService {

    InterviewQuestionAiResult generateQuestions(
            String technologyName,
            String difficulty,
            int questionCount
    );

    InterviewEvaluationAiResult evaluateAnswer(
            String technologyName,
            String difficulty,
            String question,
            String answer
    );
}