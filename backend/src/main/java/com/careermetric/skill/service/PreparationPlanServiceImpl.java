package com.careermetric.skill.service;

import com.careermetric.auth.entity.User;
import com.careermetric.job.dto.JobMatchRequest;
import com.careermetric.job.dto.JobMatchResponse;
import com.careermetric.job.dto.SkillGap;
import com.careermetric.job.service.JobMatchingService;
import com.careermetric.security.service.CurrentUserService;
import com.careermetric.skill.dto.CreatePreparationPlanRequest;
import com.careermetric.skill.dto.PreparationPlanItemResponse;
import com.careermetric.skill.dto.PreparationPlanResponse;
import com.careermetric.skill.dto.UpdatePreparationItemStatusRequest;
import com.careermetric.skill.entity.PreparationItemStatus;
import com.careermetric.skill.entity.PreparationPlan;
import com.careermetric.skill.entity.PreparationPlanItem;
import com.careermetric.skill.entity.PreparationPlanStatus;
import com.careermetric.skill.entity.Technology;
import com.careermetric.skill.repository.PreparationPlanItemRepository;
import com.careermetric.skill.repository.PreparationPlanRepository;
import com.careermetric.skill.repository.TechnologyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PreparationPlanServiceImpl
        implements PreparationPlanService {

    private final PreparationPlanRepository preparationPlanRepository;
    private final PreparationPlanItemRepository preparationPlanItemRepository;
    private final CurrentUserService currentUserService;
    private final JobMatchingService jobMatchingService;
    private final TechnologyRepository technologyRepository;

    public PreparationPlanServiceImpl(
            PreparationPlanRepository preparationPlanRepository,
            PreparationPlanItemRepository preparationPlanItemRepository,
            CurrentUserService currentUserService,
            JobMatchingService jobMatchingService,
            TechnologyRepository technologyRepository
    ) {
        this.preparationPlanRepository = preparationPlanRepository;
        this.preparationPlanItemRepository =
                preparationPlanItemRepository;
        this.currentUserService = currentUserService;
        this.jobMatchingService = jobMatchingService;
        this.technologyRepository = technologyRepository;
    }

    @Override
    public PreparationPlanResponse createPlan(
            CreatePreparationPlanRequest request
    ) {

        User user = currentUserService.getCurrentUser();

        PreparationPlan plan = new PreparationPlan();

        plan.setUser(user);
        plan.setTitle(request.title());
        plan.setDescription(request.description());
        plan.setStatus(PreparationPlanStatus.DRAFT);

        PreparationPlan saved =
                preparationPlanRepository.save(plan);

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PreparationPlanResponse> getCurrentUserPlans() {

        Long userId = currentUserService.getCurrentUserId();

        return preparationPlanRepository
                .findAllByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PreparationPlanResponse getCurrentUserPlan(
            Long planId
    ) {

        Long userId = currentUserService.getCurrentUserId();

        PreparationPlan plan =
                preparationPlanRepository
                        .findByIdAndUserId(planId, userId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Preparation plan not found"
                                )
                        );

        return toResponse(plan);
    }

    @Override
    public PreparationPlanResponse activatePlan(
            Long planId
    ) {

        Long userId = currentUserService.getCurrentUserId();

        PreparationPlan plan =
                preparationPlanRepository
                        .findByIdAndUserId(planId, userId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Preparation plan not found"
                                )
                        );

        plan.setStatus(PreparationPlanStatus.ACTIVE);

        PreparationPlan saved =
                preparationPlanRepository.save(plan);

        return toResponse(saved);
    }

    @Override
    public PreparationPlanResponse updateItemStatus(
            Long planId,
            Long itemId,
            UpdatePreparationItemStatusRequest request
    ) {

        Long userId = currentUserService.getCurrentUserId();

        PreparationPlan plan =
                preparationPlanRepository
                        .findByIdAndUserId(planId, userId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Preparation plan not found"
                                )
                        );

        PreparationPlanItem item =
                preparationPlanItemRepository
                        .findByIdAndPlanId(itemId, plan.getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Preparation plan item not found"
                                )
                        );

        item.setStatus(request.status());

        preparationPlanItemRepository.save(item);

        updatePlanStatus(plan);

        return toResponse(plan);
    }

    @Override
    public PreparationPlanResponse generatePlanFromJobMatch(
            Long resumeId,
            Long jobDescriptionId
    ) {

        JobMatchResponse matchResponse =
                jobMatchingService.matchResumeWithJob(
                        new JobMatchRequest(
                                resumeId,
                                jobDescriptionId
                        )
                );

        PreparationPlan plan = new PreparationPlan();

        plan.setUser(
                currentUserService.getCurrentUser()
        );

        plan.setTitle(
                "Preparation Plan for Job Description "
                        + jobDescriptionId
        );

        plan.setDescription(
                "Personalized preparation plan generated from "
                        + "resume and job skill gaps."
        );

        plan.setStatus(
                PreparationPlanStatus.DRAFT
        );

        PreparationPlan savedPlan =
                preparationPlanRepository.save(plan);

        List<SkillGap> skillGaps =
                matchResponse.skillGaps();

        if (skillGaps != null) {

            for (SkillGap skillGap : skillGaps) {

                if (skillGap == null
                        || skillGap.skill() == null
                        || skillGap.skill().isBlank()) {
                    continue;
                }

                PreparationPlanItem item =
                        new PreparationPlanItem();

                item.setPlan(savedPlan);

                item.setSkill(
                        skillGap.skill()
                );

                item.setPriority(
                        skillGap.importance() != null
                                ? skillGap.importance()
                                : "MEDIUM"
                );

                item.setDescription(
                        buildPreparationDescription(
                                skillGap
                        )
                );

                item.setStatus(
                        PreparationItemStatus.PENDING
                );

                Technology technology =
                        findTechnology(
                                skillGap.skill()
                        );

                item.setTechnology(technology);

                preparationPlanItemRepository.save(item);
            }
        }

        return toResponse(savedPlan);
    }

    private void updatePlanStatus(
            PreparationPlan plan
    ) {

        List<PreparationPlanItem> items =
                preparationPlanItemRepository
                        .findAllByPlanId(plan.getId());

        if (items.isEmpty()) {
            return;
        }

        boolean allCompleted =
                items.stream()
                        .allMatch(item ->
                                item.getStatus()
                                        == PreparationItemStatus.COMPLETED
                        );

        if (allCompleted) {

            plan.setStatus(
                    PreparationPlanStatus.COMPLETED
            );

            preparationPlanRepository.save(plan);
        }
    }

    private String buildPreparationDescription(
            SkillGap skillGap
    ) {

        if (skillGap.suggestedPreparation() != null
                && !skillGap.suggestedPreparation().isEmpty()) {

            return String.join(
                    " ",
                    skillGap.suggestedPreparation()
            );
        }

        if (skillGap.reason() != null
                && !skillGap.reason().isBlank()) {

            return skillGap.reason();
        }

        return "Review and practice "
                + skillGap.skill()
                + ".";
    }

    private Technology findTechnology(
            String skill
    ) {

        if (skill == null || skill.isBlank()) {
            return null;
        }

        return technologyRepository
                .findByNameIgnoreCase(skill.trim())
                .orElse(null);
    }

    private PreparationPlanResponse toResponse(
            PreparationPlan plan
    ) {

        List<PreparationPlanItemResponse> items =
                preparationPlanItemRepository
                        .findAllByPlanId(plan.getId())
                        .stream()
                        .map(this::toItemResponse)
                        .toList();

        return new PreparationPlanResponse(
                plan.getId(),
                plan.getTitle(),
                plan.getDescription(),
                plan.getStatus().name(),
                items
        );
    }

    private PreparationPlanItemResponse toItemResponse(
            PreparationPlanItem item
    ) {

        Long technologyId = null;
        String technologyName = null;

        if (item.getTechnology() != null) {

            technologyId =
                    item.getTechnology().getId();

            technologyName =
                    item.getTechnology().getName();
        }

        return new PreparationPlanItemResponse(
                item.getId(),
                technologyId,
                technologyName,
                item.getSkill(),
                item.getPriority(),
                item.getDescription(),
                item.getStatus().name()
        );
    }
}