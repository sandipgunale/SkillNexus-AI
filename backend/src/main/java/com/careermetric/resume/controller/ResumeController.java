package com.careermetric.resume.controller;

import com.careermetric.common.dto.ApiResponse;
import com.careermetric.resume.dto.ResumeAnalysisResponse;
import com.careermetric.resume.dto.ResumeDetailResponse;
import com.careermetric.resume.dto.ResumeResponse;
import com.careermetric.resume.service.ResumeService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@SecurityRequirement(name = "bearerAuth")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ResumeResponse> uploadResume(
            @RequestParam("file") MultipartFile file
    ) {

        ResumeResponse response =
                resumeService.uploadResume(file);

        return ApiResponse.success(
                "Resume uploaded successfully",
                response
        );
    }

    @GetMapping
    public ApiResponse<List<ResumeResponse>> getMyResumes() {

        List<ResumeResponse> resumes =
                resumeService.getMyResumes();

        return ApiResponse.success(
                "Resumes retrieved successfully",
                resumes
        );
    }

    @GetMapping("/{resumeId}")
    public ApiResponse<ResumeDetailResponse> getMyResume(
            @PathVariable Long resumeId
    ) {

        ResumeDetailResponse response =
                resumeService.getMyResume(resumeId);

        return ApiResponse.success(
                "Resume retrieved successfully",
                response
        );
    }

    @PostMapping("/{resumeId}/analyze")
    public ApiResponse<ResumeAnalysisResponse> analyzeResume(
            @PathVariable Long resumeId
    ) {

        ResumeAnalysisResponse response =
                resumeService.analyzeMyResume(resumeId);

        return ApiResponse.success(
                "Resume analyzed successfully",
                response
        );
    }

    @GetMapping("/{resumeId}/analysis")
    public ApiResponse<ResumeAnalysisResponse> getResumeAnalysis(
            @PathVariable Long resumeId
    ) {

        ResumeAnalysisResponse response =
                resumeService.getMyResumeAnalysis(resumeId);

        return ApiResponse.success(
                "Resume analysis retrieved successfully",
                response
        );
    }

    @DeleteMapping("/{resumeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMyResume(
            @PathVariable Long resumeId
    ) {

        resumeService.deleteMyResume(resumeId);
    }
}