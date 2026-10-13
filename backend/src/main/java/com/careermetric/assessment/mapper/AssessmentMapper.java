package com.careermetric.assessment.mapper;

import com.careermetric.assessment.dto.AssessmentDetailResponse;
import com.careermetric.assessment.dto.AssessmentResponse;
import com.careermetric.assessment.dto.QuestionResponse;
import com.careermetric.assessment.entity.Assessment;
import com.careermetric.assessment.entity.Question;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AssessmentMapper {

    public AssessmentResponse toResponse(
            Assessment assessment
    ) {

        return new AssessmentResponse(
                assessment.getId(),
                assessment.getTechnology().getId(),
                assessment.getTechnology().getName(),
                assessment.getDifficulty(),
                assessment.getStatus(),
                assessment.getQuestionCount(),
                assessment.getCreatedAt(),
                assessment.getUpdatedAt()
        );
    }

    public AssessmentDetailResponse toDetailResponse(
            Assessment assessment,
            List<Question> questions
    ) {

        List<QuestionResponse> questionResponses =
                questions.stream()
                        .map(this::toQuestionResponse)
                        .toList();

        return new AssessmentDetailResponse(
                assessment.getId(),
                assessment.getTechnology().getId(),
                assessment.getTechnology().getName(),
                assessment.getDifficulty(),
                assessment.getStatus(),
                assessment.getQuestionCount(),
                questionResponses,
                assessment.getCreatedAt(),
                assessment.getUpdatedAt()
        );
    }

    private QuestionResponse toQuestionResponse(
            Question question
    ) {

        return new QuestionResponse(
                question.getId(),
                question.getQuestionText(),
                question.getQuestionType(),
                question.getOptions()
        );
    }
}