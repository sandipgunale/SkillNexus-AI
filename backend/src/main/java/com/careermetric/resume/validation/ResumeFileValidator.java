package com.careermetric.resume.validation;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Component
public class ResumeFileValidator {

    private static final long MAX_FILE_SIZE =
            5 * 1024 * 1024L;

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of(
                    "application/pdf",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            );

    public void validate(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Resume file is required"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Resume file must not exceed 5 MB"
            );
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !ALLOWED_CONTENT_TYPES.contains(
                        contentType.toLowerCase()
                )) {

            throw new IllegalArgumentException(
                    "Only PDF and DOCX resume files are allowed"
            );
        }

        String originalFileName =
                file.getOriginalFilename();

        if (originalFileName == null ||
                originalFileName.isBlank()) {

            throw new IllegalArgumentException(
                    "Resume file name is required"
            );
        }

        String lowerCaseFileName =
                originalFileName.toLowerCase();

        boolean validExtension =
                lowerCaseFileName.endsWith(".pdf") ||
                lowerCaseFileName.endsWith(".docx");

        if (!validExtension) {
            throw new IllegalArgumentException(
                    "Resume must have a .pdf or .docx extension"
            );
        }
    }
}