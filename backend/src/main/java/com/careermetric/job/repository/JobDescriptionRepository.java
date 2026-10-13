package com.careermetric.job.repository;

import com.careermetric.job.entity.JobDescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobDescriptionRepository
        extends JpaRepository<JobDescription, Long> {

    List<JobDescription> findAllByUserId(Long userId);

    Optional<JobDescription> findByIdAndUserId(
            Long jobDescriptionId,
            Long userId
    );
}