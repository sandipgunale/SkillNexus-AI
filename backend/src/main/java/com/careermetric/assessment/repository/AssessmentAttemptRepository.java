package com.careermetric.assessment.repository;

import com.careermetric.assessment.entity.AssessmentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssessmentAttemptRepository
        extends JpaRepository<AssessmentAttempt, Long> {

    List<AssessmentAttempt> findAllByUserId(Long userId);

    Optional<AssessmentAttempt> findByIdAndUserId(
            Long attemptId,
            Long userId
    );

    Optional<AssessmentAttempt> findByIdAndAssessmentIdAndUserId(
            Long attemptId,
            Long assessmentId,
            Long userId
    );

    Optional<AssessmentAttempt>
    findFirstByUserIdAndAssessmentTechnologyIdAndCompletedAtIsNotNullOrderByCompletedAtDesc(
            Long userId,
            Long technologyId
    );
}