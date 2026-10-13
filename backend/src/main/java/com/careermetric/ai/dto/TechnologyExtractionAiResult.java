package com.careermetric.ai.dto;

import java.util.List;

public record TechnologyExtractionAiResult(
        List<ExtractedTechnology> technologies
) {
}