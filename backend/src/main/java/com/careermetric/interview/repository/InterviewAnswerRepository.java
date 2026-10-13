package com.careermetric.interview.repository;

import com.careermetric.interview.entity.InterviewAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterviewAnswerRepository
        extends JpaRepository<InterviewAnswer, Long> {

    Optional<InterviewAnswer> findByInterviewQuestionId(
            Long questionId
    );

    long countByInterviewQuestionInterviewSessionId(
            Long interviewId
    );

    List<InterviewAnswer>
    findAllByInterviewQuestionInterviewSessionId(
            Long interviewId
    );
}