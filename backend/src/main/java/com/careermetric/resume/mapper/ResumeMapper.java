package com.careermetric.resume.mapper;

import com.careermetric.resume.dto.ResumeDetailResponse;
import com.careermetric.resume.dto.ResumeResponse;
import com.careermetric.resume.entity.Resume;
import org.springframework.stereotype.Component;

@Component
public class ResumeMapper {

    public ResumeResponse toResponse(Resume resume) {

        return new ResumeResponse(
                resume.getId(),
                resume.getFileName(),
                resume.getFileType(),
                resume.getStatus(),
                resume.getCreatedAt(),
                resume.getUpdatedAt()
        );
    }

    public ResumeDetailResponse toDetailResponse(Resume resume) {

        return new ResumeDetailResponse(
                resume.getId(),
                resume.getFileName(),
                resume.getFileType(),
                resume.getExtractedText(),
                resume.getStatus(),
                resume.getCreatedAt(),
                resume.getUpdatedAt()
        );
    }
}