package com.careermetric.ai.dto;

import java.util.List;

public record ExtractedTechnology(
        String name,
        String category,
        List<String> evidence
) {
}