package com.careermetric.job.repository;

import com.careermetric.job.entity.JobRequirement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobRequirementRepository extends JpaRepository<JobRequirement, Long> {

    List<JobRequirement> findAllByJobDescriptionId(Long jobDescriptionId);

    void deleteAllByJobDescriptionId(Long jobDescriptionId);
}