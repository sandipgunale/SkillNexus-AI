package com.careermetric.resume.repository;

import com.careermetric.resume.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findAllByUserId(Long userId);

    Optional<Resume> findByIdAndUserId(
            Long resumeId,
            Long userId
    );

    boolean existsByIdAndUserId(
            Long resumeId,
            Long userId
    );
}