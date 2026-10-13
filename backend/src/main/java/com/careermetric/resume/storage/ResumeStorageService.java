package com.careermetric.resume.storage;

import org.springframework.web.multipart.MultipartFile;

public interface ResumeStorageService {

    String store(
            MultipartFile file,
            Long userId
    );

    void delete(String filePath);
}