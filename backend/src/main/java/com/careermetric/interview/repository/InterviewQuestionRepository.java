package com.careermetric.interview.repository;

import com.careermetric.interview.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterviewQuestionRepository
        extends JpaRepository<InterviewQuestion, Long> {

    List<InterviewQuestion> findAllByInterviewSessionIdOrderByQuestionNumber(
            Long interviewSessionId
    );

    Optional<InterviewQuestion> findByIdAndInterviewSessionId(
            Long questionId,
            Long interviewSessionId
    );

    long countByInterviewSessionId(
            Long interviewSessionId
    );
}