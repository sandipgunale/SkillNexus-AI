package com.careermetric.ai.rag.dto;

import java.util.List;

public record RagResponse(
        String answer,
        List<RagSource> sources
) {
}