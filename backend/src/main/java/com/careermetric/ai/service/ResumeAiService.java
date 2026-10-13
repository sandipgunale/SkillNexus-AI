package com.careermetric.ai.service;

import com.careermetric.ai.dto.ResumeAnalysisAiResult;

public interface ResumeAiService {

    ResumeAnalysisAiResult analyzeResume(String resumeText);
}