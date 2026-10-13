package com.careermetric.job.service;

import com.careermetric.job.dto.CreateJobDescriptionRequest;
import com.careermetric.job.dto.JobDescriptionDetailResponse;
import com.careermetric.job.dto.JobDescriptionResponse;

import java.util.List;

public interface JobDescriptionService {

    JobDescriptionResponse createJobDescription(
            CreateJobDescriptionRequest request
    );

    List<JobDescriptionResponse> getMyJobDescriptions();

    JobDescriptionResponse getMyJobDescription(
            Long jobDescriptionId
    );

    JobDescriptionDetailResponse analyzeJobDescription(
            Long jobDescriptionId
    );
}