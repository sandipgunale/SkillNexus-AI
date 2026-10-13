package com.careermetric.ai.dto;

import java.util.List;

public record AssessmentQuestionAi(

        String questionText,

        String questionType,

        List<String> options,

        String correctAnswer,

        String explanation

) {
}