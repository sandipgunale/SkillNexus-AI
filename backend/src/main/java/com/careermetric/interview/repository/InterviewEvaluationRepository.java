package com.careermetric.interview.repository;

import com.careermetric.interview.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InterviewEvaluationRepository
        extends JpaRepository<InterviewEvaluation, Long> {

    Optional<InterviewEvaluation> findByInterviewAnswerId(
            Long answerId
    );
}