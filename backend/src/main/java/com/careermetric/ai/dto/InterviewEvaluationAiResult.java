package com.careermetric.ai.dto;

import java.util.List;

public record InterviewEvaluationAiResult(

        Integer score,

        String feedback,

        List<String> strengths,

        List<String> improvements

) {
}