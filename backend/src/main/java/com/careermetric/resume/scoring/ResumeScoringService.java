package com.careermetric.resume.scoring;

import com.careermetric.ai.dto.ResumeAnalysisAiResult;

public interface ResumeScoringService {

    ResumeScoringResult calculateScore(
            String resumeText,
            ResumeAnalysisAiResult aiResult
    );
}