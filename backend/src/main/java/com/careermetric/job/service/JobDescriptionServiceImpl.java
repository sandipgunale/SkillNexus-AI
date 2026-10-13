package com.careermetric.job.service;

import com.careermetric.ai.dto.JobDescriptionAiResult;
import com.careermetric.ai.service.JobAiService;
import com.careermetric.job.dto.CreateJobDescriptionRequest;
import com.careermetric.job.dto.JobDescriptionDetailResponse;
import com.careermetric.job.dto.JobDescriptionResponse;
import com.careermetric.job.dto.JobRequirementResponse;
import com.careermetric.job.entity.JobDescription;
import com.careermetric.job.entity.JobDescriptionStatus;
import com.careermetric.job.entity.JobRequirement;
import com.careermetric.job.entity.JobRequirementType;
import com.careermetric.job.repository.JobDescriptionRepository;
import com.careermetric.job.repository.JobRequirementRepository;
import com.careermetric.security.service.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class JobDescriptionServiceImpl implements JobDescriptionService {

    private final JobDescriptionRepository jobDescriptionRepository;
    private final JobRequirementRepository jobRequirementRepository;
    private final CurrentUserService currentUserService;
    private final JobAiService jobAiService;

    public JobDescriptionServiceImpl(
            JobDescriptionRepository jobDescriptionRepository,
            JobRequirementRepository jobRequirementRepository,
            CurrentUserService currentUserService,
            JobAiService jobAiService
    ) {
        this.jobDescriptionRepository = jobDescriptionRepository;
        this.jobRequirementRepository = jobRequirementRepository;
        this.currentUserService = currentUserService;
        this.jobAiService = jobAiService;
    }

    @Override
    public JobDescriptionResponse createJobDescription(
            CreateJobDescriptionRequest request
    ) {
        JobDescription jobDescription = new JobDescription();

        jobDescription.setUser(currentUserService.getCurrentUser());
        jobDescription.setTitle(request.title().trim());
        jobDescription.setDescriptionText(request.descriptionText().trim());
        jobDescription.setStatus(JobDescriptionStatus.CREATED);

        JobDescription saved = jobDescriptionRepository.save(jobDescription);

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobDescriptionResponse> getMyJobDescriptions() {

        Long userId = currentUserService.getCurrentUserId();

        return jobDescriptionRepository
                .findAllByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobDescriptionResponse getMyJobDescription(
            Long jobDescriptionId
    ) {

        JobDescription jobDescription =
                getOwnedJobDescription(jobDescriptionId);

        return toResponse(jobDescription);
    }

    @Override
    public JobDescriptionDetailResponse analyzeJobDescription(
            Long jobDescriptionId
    ) {

        JobDescription jobDescription =
                getOwnedJobDescription(jobDescriptionId);

        if (jobDescription.getDescriptionText() == null
                || jobDescription.getDescriptionText().isBlank()) {

            throw new IllegalStateException(
                    "Job description cannot be empty"
            );
        }

        try {

            JobDescriptionAiResult aiResult =
                    jobAiService.analyzeJobDescription(
                            jobDescription.getDescriptionText()
                    );

            /*
             * Remove previously generated requirements.
             *
             * This makes re-analysis safe.
             */
            jobRequirementRepository
                    .deleteAllByJobDescriptionId(jobDescription.getId());

            /*
             * Save AI-generated requirements.
             *
             * saveRequirement() now prevents duplicates.
             */
            saveRequirements(
                    jobDescription,
                    aiResult
            );

            jobDescription.setStatus(
                    JobDescriptionStatus.ANALYZED
            );

            JobDescription saved =
                    jobDescriptionRepository.save(jobDescription);

            return toDetailResponse(saved);

        } catch (RuntimeException exception) {

            jobDescription.setStatus(
                    JobDescriptionStatus.FAILED
            );

            jobDescriptionRepository.save(jobDescription);

            throw exception;
        }
    }

    private void saveRequirements(
            JobDescription jobDescription,
            JobDescriptionAiResult aiResult
    ) {

        if (aiResult.requiredSkills() != null) {

            for (String skill : aiResult.requiredSkills()) {

                saveRequirement(
                        jobDescription,
                        skill,
                        JobRequirementType.REQUIRED
                );
            }
        }

        if (aiResult.preferredSkills() != null) {

            for (String skill : aiResult.preferredSkills()) {

                saveRequirement(
                        jobDescription,
                        skill,
                        JobRequirementType.PREFERRED
                );
            }
        }

        if (aiResult.technologyRequirements() != null) {

            for (String technology :
                    aiResult.technologyRequirements()) {

                saveRequirement(
                        jobDescription,
                        technology,
                        JobRequirementType.REQUIRED
                );
            }
        }
    }

    private void saveRequirement(
            JobDescription jobDescription,
            String requirement,
            JobRequirementType type
    ) {

        if (requirement == null || requirement.isBlank()) {
            return;
        }

        String cleanedRequirement = requirement.trim();

        /*
         * Prevent duplicate requirements regardless of:
         *
         * Java
         * java
         * JAVA
         *
         * This also prevents duplicates coming from
         * requiredSkills + technologyRequirements.
         */
        boolean alreadyExists =
                jobRequirementRepository
                        .findAllByJobDescriptionId(
                                jobDescription.getId()
                        )
                        .stream()
                        .anyMatch(existing ->
                                normalize(
                                        existing.getRequirement()
                                ).equals(
                                        normalize(cleanedRequirement)
                                )
                        );

        if (alreadyExists) {
            return;
        }

        JobRequirement jobRequirement = new JobRequirement();

        jobRequirement.setJobDescription(jobDescription);
        jobRequirement.setRequirement(cleanedRequirement);
        jobRequirement.setType(type);

        jobRequirementRepository.save(jobRequirement);
    }

    private String normalize(String value) {

        return value
                .toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("\\s+", " ");
    }

    private JobDescription getOwnedJobDescription(
            Long jobDescriptionId
    ) {

        Long userId = currentUserService.getCurrentUserId();

        return jobDescriptionRepository
                .findByIdAndUserId(
                        jobDescriptionId,
                        userId
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Job description not found"
                        )
                );
    }

    private JobDescriptionResponse toResponse(
            JobDescription jobDescription
    ) {

        return new JobDescriptionResponse(
                jobDescription.getId(),
                jobDescription.getTitle(),
                jobDescription.getDescriptionText(),
                jobDescription.getStatus(),
                jobDescription.getCreatedAt(),
                jobDescription.getUpdatedAt()
        );
    }

    private JobDescriptionDetailResponse toDetailResponse(
            JobDescription jobDescription
    ) {

        List<JobRequirementResponse> requirements =
                jobRequirementRepository
                        .findAllByJobDescriptionId(
                                jobDescription.getId()
                        )
                        .stream()
                        .map(requirement ->
                                new JobRequirementResponse(
                                        requirement.getId(),
                                        requirement.getRequirement(),
                                        requirement.getType()
                                )
                        )
                        .toList();

        return new JobDescriptionDetailResponse(
                jobDescription.getId(),
                jobDescription.getTitle(),
                jobDescription.getDescriptionText(),
                jobDescription.getStatus(),
                requirements,
                jobDescription.getCreatedAt(),
                jobDescription.getUpdatedAt()
        );
    }
}