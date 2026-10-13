package com.careermetric.ai.service;

import com.careermetric.ai.dto.TechnologyExtractionAiResult;

public interface TechnologyExtractionAiService {

    TechnologyExtractionAiResult extractTechnologies(
            String resumeText
    );
}