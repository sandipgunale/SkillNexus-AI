package com.careermetric.skill.service;

import com.careermetric.ai.dto.TechnologyExtractionAiResult;
import com.careermetric.resume.entity.Resume;

public interface TechnologyPersistenceService {

    void syncExtractedTechnologies(
            Resume resume,
            TechnologyExtractionAiResult extractionResult
    );
}