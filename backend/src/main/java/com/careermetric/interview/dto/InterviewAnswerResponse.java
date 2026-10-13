package com.careermetric.interview.dto;

public record InterviewAnswerResponse(

        Long questionId,

        String answer,

        String status
) {
}