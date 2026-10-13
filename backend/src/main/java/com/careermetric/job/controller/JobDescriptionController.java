package com.careermetric.job.controller;

import com.careermetric.job.dto.CreateJobDescriptionRequest;
import com.careermetric.job.dto.JobDescriptionDetailResponse;
import com.careermetric.job.dto.JobDescriptionResponse;
import com.careermetric.job.dto.JobMatchRequest;
import com.careermetric.job.dto.JobMatchResponse;
import com.careermetric.job.service.JobDescriptionService;
import com.careermetric.job.service.JobMatchingService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@SecurityRequirement(name = "bearerAuth")
public class JobDescriptionController {

    private final JobDescriptionService jobDescriptionService;
    private final JobMatchingService jobMatchingService;

    public JobDescriptionController(
            JobDescriptionService jobDescriptionService,
            JobMatchingService jobMatchingService
    ) {
        this.jobDescriptionService = jobDescriptionService;
        this.jobMatchingService = jobMatchingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobDescriptionResponse createJobDescription(
            @Valid @RequestBody CreateJobDescriptionRequest request
    ) {
        return jobDescriptionService.createJobDescription(request);
    }

    @GetMapping
    public List<JobDescriptionResponse> getMyJobDescriptions() {
        return jobDescriptionService.getMyJobDescriptions();
    }

    @GetMapping("/{jobDescriptionId}")
    public JobDescriptionResponse getMyJobDescription(
            @PathVariable Long jobDescriptionId
    ) {
        return jobDescriptionService.getMyJobDescription(
                jobDescriptionId
        );
    }

    @PostMapping("/{jobDescriptionId}/analyze")
    public JobDescriptionDetailResponse analyzeJobDescription(
            @PathVariable Long jobDescriptionId
    ) {
        return jobDescriptionService.analyzeJobDescription(
                jobDescriptionId
        );
    }

    @PostMapping("/match")
    public JobMatchResponse matchResumeWithJob(
            @Valid @RequestBody JobMatchRequest request
    ) {
        return jobMatchingService.matchResumeWithJob(request);
    }
}