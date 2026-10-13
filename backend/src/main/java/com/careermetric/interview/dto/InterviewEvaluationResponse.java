package com.careermetric.interview.dto;

import java.util.List;

public record InterviewEvaluationResponse(

        Long questionId,

        Integer score,

        String feedback,

        List<String> strengths,

        List<String> improvements

) {
}