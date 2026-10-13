package com.careermetric.interview.dto;

public record InterviewQuestionResponse(

        Long id,

        Integer questionNumber,

        String questionText
) {
}