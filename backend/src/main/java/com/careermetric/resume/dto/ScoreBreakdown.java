package com.careermetric.resume.dto;

public record ScoreBreakdown(
        Integer skills,
        Integer projects,
        Integer experience,
        Integer education,
        Integer keywords,
        Integer structure,
        Integer formatting
) {
}