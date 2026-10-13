package com.careermetric.assessment.repository;

import com.careermetric.assessment.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssessmentRepository
        extends JpaRepository<Assessment, Long> {

    List<Assessment> findAllByUserId(Long userId);

    Optional<Assessment> findByIdAndUserId(
            Long assessmentId,
            Long userId
    );

    boolean existsByIdAndUserId(
            Long assessmentId,
            Long userId
    );
}