package com.careermetric.interview.repository;

import com.careermetric.interview.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterviewSessionRepository
        extends JpaRepository<InterviewSession, Long> {

    List<InterviewSession> findAllByUserId(Long userId);

    Optional<InterviewSession> findByIdAndUserId(
            Long interviewId,
            Long userId
    );

    Optional<InterviewSession>
    findFirstByUserIdAndTechnologyIdAndCompletedAtIsNotNullOrderByCompletedAtDesc(
            Long userId,
            Long technologyId
    );
}