package com.careermetric.resume.dto;

import com.careermetric.resume.entity.ResumeStatus;

import java.time.LocalDateTime;

public record ResumeDetailResponse(
        Long id,
        String fileName,
        String fileType,
        String extractedText,
        ResumeStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}