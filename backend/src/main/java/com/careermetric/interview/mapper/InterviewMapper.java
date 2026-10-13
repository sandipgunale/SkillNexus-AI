package com.careermetric.interview.mapper;

import com.careermetric.interview.dto.InterviewQuestionResponse;
import com.careermetric.interview.dto.InterviewResponse;
import com.careermetric.interview.entity.InterviewQuestion;
import com.careermetric.interview.entity.InterviewSession;
import org.springframework.stereotype.Component;

@Component
public class InterviewMapper {

    public InterviewResponse toResponse(
            InterviewSession interview
    ) {

        return new InterviewResponse(
                interview.getId(),
                interview.getTechnology().getId(),
                interview.getTechnology().getName(),
                interview.getDifficulty(),
                interview.getStatus(),
                interview.getQuestionCount(),
                interview.getScore(),
                interview.getStartedAt(),
                interview.getCompletedAt()
        );
    }

    public InterviewQuestionResponse toQuestionResponse(
            InterviewQuestion question
    ) {

        return new InterviewQuestionResponse(
                question.getId(),
                question.getQuestionNumber(),
                question.getQuestionText()
        );
    }
}