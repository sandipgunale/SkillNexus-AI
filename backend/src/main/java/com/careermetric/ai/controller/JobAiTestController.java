package com.careermetric.ai.controller;

import com.careermetric.ai.dto.JobDescriptionAiResult;
import com.careermetric.ai.service.JobAiService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test/job-ai")
public class JobAiTestController {

    private final JobAiService jobAiService;

    public JobAiTestController(JobAiService jobAiService) {
        this.jobAiService = jobAiService;
    }

    @PostMapping
    public JobDescriptionAiResult analyze(
            @RequestBody String jobDescription
    ) {
        return jobAiService.analyzeJobDescription(jobDescription);
    }
}