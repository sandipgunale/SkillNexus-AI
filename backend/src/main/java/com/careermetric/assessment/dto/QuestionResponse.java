package com.careermetric.assessment.dto;

import com.careermetric.assessment.entity.QuestionType;

import java.util.List;

public record QuestionResponse(

        Long id,

        String questionText,

        QuestionType questionType,

        List<String> options

) {
}