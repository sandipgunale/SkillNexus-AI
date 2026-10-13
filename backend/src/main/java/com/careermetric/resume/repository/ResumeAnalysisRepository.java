package com.careermetric.resume.repository;

import com.careermetric.resume.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeAnalysisRepository
        extends JpaRepository<ResumeAnalysis, Long> {

    Optional<ResumeAnalysis> findByResumeId(Long resumeId);

    boolean existsByResumeId(Long resumeId);
}