package com.careermetric.ai.dto;

import java.util.List;

public record ResumeAnalysisAiResult(
        String summary,
        List<String> strengths,
        List<String> weaknesses,
        List<String> missingElements,
        List<String> suggestions,
        ResumeSectionAnalysis sections
) {
}