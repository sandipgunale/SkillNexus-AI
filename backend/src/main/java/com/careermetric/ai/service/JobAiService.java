package com.careermetric.ai.service;

import com.careermetric.ai.dto.JobDescriptionAiResult;

public interface JobAiService {

    JobDescriptionAiResult analyzeJobDescription(
            String jobDescription
    );
}