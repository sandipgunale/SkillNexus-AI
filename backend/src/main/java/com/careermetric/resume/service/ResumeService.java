package com.careermetric.resume.service;

import com.careermetric.resume.dto.ResumeAnalysisResponse;
import com.careermetric.resume.dto.ResumeDetailResponse;
import com.careermetric.resume.dto.ResumeResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResumeService {

    ResumeResponse uploadResume(MultipartFile file);

    List<ResumeResponse> getMyResumes();

    ResumeDetailResponse getMyResume(Long resumeId);

    ResumeAnalysisResponse analyzeMyResume(Long resumeId);

    ResumeAnalysisResponse getMyResumeAnalysis(Long resumeId);

    void deleteMyResume(Long resumeId);
}