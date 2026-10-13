package com.careermetric.resume.extraction;

import org.springframework.web.multipart.MultipartFile;

public interface ResumeTextExtractionService {

    String extractText(MultipartFile file);
}