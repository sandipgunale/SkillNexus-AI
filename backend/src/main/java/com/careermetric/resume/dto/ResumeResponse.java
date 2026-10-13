package com.careermetric.resume.dto;

import com.careermetric.resume.entity.ResumeStatus;

import java.time.LocalDateTime;

public record ResumeResponse(
        Long id,
        String fileName,
        String fileType,
        ResumeStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}