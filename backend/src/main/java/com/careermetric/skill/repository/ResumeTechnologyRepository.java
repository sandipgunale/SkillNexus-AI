package com.careermetric.skill.repository;

import com.careermetric.skill.entity.ResumeTechnology;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeTechnologyRepository
        extends JpaRepository<ResumeTechnology, Long> {

    List<ResumeTechnology> findAllByResumeId(Long resumeId);

    List<ResumeTechnology> findAllByResumeUserId(Long userId);

    Optional<ResumeTechnology> findByResumeIdAndTechnologyId(
            Long resumeId,
            Long technologyId
    );

    boolean existsByResumeIdAndTechnologyId(
            Long resumeId,
            Long technologyId
    );

    boolean existsByResumeUserIdAndTechnologyId(
        Long userId,
        Long technologyId
    );

    void deleteAllByResumeId(Long resumeId);
}