package com.careermetric.assessment.mapper;

import com.careermetric.assessment.dto.AssessmentAttemptResponse;
import com.careermetric.assessment.entity.AssessmentAttempt;
import org.springframework.stereotype.Component;

@Component
public class AssessmentAttemptMapper {

    public AssessmentAttemptResponse toResponse(
            AssessmentAttempt attempt
    ) {

        return new AssessmentAttemptResponse(
                attempt.getId(),
                attempt.getAssessment().getId(),
                attempt.getAssessment()
                        .getTechnology()
                        .getName(),
                attempt.getStatus(),
                attempt.getScore(),
                attempt.getCorrectAnswers(),
                attempt.getTotalQuestions(),
                attempt.getStartedAt(),
                attempt.getCompletedAt()
        );
    }
}