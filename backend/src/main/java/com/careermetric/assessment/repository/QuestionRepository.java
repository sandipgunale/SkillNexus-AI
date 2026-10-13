package com.careermetric.assessment.repository;

import com.careermetric.assessment.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuestionRepository
        extends JpaRepository<Question, Long> {

    List<Question> findAllByAssessmentId(
            Long assessmentId
    );

    Optional<Question> findByIdAndAssessmentId(
            Long questionId,
            Long assessmentId
    );

    long countByAssessmentId(
            Long assessmentId
    );

    void deleteAllByAssessmentId(
            Long assessmentId
    );
}