package com.careermetric.ai.dto;

public record ResumeSectionAnalysis(
        SectionEvaluation skills,
        SectionEvaluation projects,
        SectionEvaluation experience,
        SectionEvaluation education,
        SectionEvaluation keywords,
        SectionEvaluation structure,
        SectionEvaluation formatting
) {
}