package com.careermetric.ai.dto;

import java.util.List;

public record JobDescriptionAiResult(

        List<String> requiredSkills,

        List<String> preferredSkills,

        String experience,

        List<String> responsibilities,

        List<String> technologyRequirements
) {
}