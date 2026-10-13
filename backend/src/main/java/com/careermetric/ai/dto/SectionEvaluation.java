package com.careermetric.ai.dto;

import java.util.List;

public record SectionEvaluation(
        boolean present,
        String assessment,
        List<String> evidence
) {
}