package com.careermetric.job.service;

import com.careermetric.job.dto.JobMatchRequest;
import com.careermetric.job.dto.JobMatchResponse;

public interface JobMatchingService {

    JobMatchResponse matchResumeWithJob(JobMatchRequest request);
}