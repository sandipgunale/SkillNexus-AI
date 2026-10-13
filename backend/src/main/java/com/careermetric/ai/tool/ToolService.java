package com.careermetric.ai.tool;

import com.careermetric.resume.entity.Resume;
import com.careermetric.resume.repository.ResumeRepository;
import com.careermetric.security.service.CurrentUserService;
import com.careermetric.skill.entity.PreparationPlan;
import com.careermetric.skill.entity.PreparationPlanItem;
import com.careermetric.skill.entity.PreparationPlanStatus;
import com.careermetric.skill.repository.PreparationPlanItemRepository;
import com.careermetric.skill.repository.PreparationPlanRepository;
import com.careermetric.skill.entity.ResumeTechnology;
import com.careermetric.skill.repository.ResumeTechnologyRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class ToolService {

    private final CurrentUserService currentUserService;
    private final ResumeTechnologyRepository resumeTechnologyRepository;
    private final ResumeRepository resumeRepository;
    private final PreparationPlanRepository preparationPlanRepository;
    private final PreparationPlanItemRepository preparationPlanItemRepository;

    public ToolService(
            CurrentUserService currentUserService,
            ResumeTechnologyRepository resumeTechnologyRepository,
            ResumeRepository resumeRepository,
            PreparationPlanRepository preparationPlanRepository,
            PreparationPlanItemRepository preparationPlanItemRepository
    ) {
        this.currentUserService = currentUserService;
        this.resumeTechnologyRepository = resumeTechnologyRepository;
        this.resumeRepository = resumeRepository;
        this.preparationPlanRepository = preparationPlanRepository;
        this.preparationPlanItemRepository =
                preparationPlanItemRepository;
    }

    public List<ResumeTechnology> getCurrentUserResumeTechnologies() {

        Long userId = currentUserService.getCurrentUserId();

        return resumeTechnologyRepository
                .findAllByResumeUserId(userId);
    }

    public Resume getCurrentUserLatestResume() {

        Long userId = currentUserService.getCurrentUserId();

        List<Resume> resumes =
                resumeRepository.findAllByUserId(userId);

        if (resumes.isEmpty()) {
            return null;
        }

        return resumes.stream()
                .max(
                        Comparator.comparing(
                                Resume::getCreatedAt,
                                Comparator.nullsLast(
                                        Comparator.naturalOrder()
                                )
                        )
                )
                .orElse(null);
    }

    public String getCurrentUserPreparationPlan() {

        Long userId = currentUserService.getCurrentUserId();

        PreparationPlan plan =
                preparationPlanRepository
                        .findFirstByUserIdAndStatusOrderByCreatedAtDesc(
                                userId,
                                PreparationPlanStatus.ACTIVE
                        )
                        .orElseGet(() ->
                                preparationPlanRepository
                                        .findFirstByUserIdOrderByCreatedAtDesc(
                                                userId
                                        )
                                        .orElse(null)
                        );

        if (plan == null) {
            return "No preparation plan is available for the authenticated user.";
        }

        List<PreparationPlanItem> items =
                preparationPlanItemRepository
                        .findAllByPlanId(plan.getId());

        StringBuilder result = new StringBuilder();

        result.append("PREPARATION PLAN ID: ")
                .append(plan.getId())
                .append("\n");

        result.append("TITLE: ")
                .append(plan.getTitle())
                .append("\n");

        result.append("DESCRIPTION: ")
                .append(
                        plan.getDescription() != null
                                ? plan.getDescription()
                                : "No description"
                )
                .append("\n");

        result.append("STATUS: ")
                .append(plan.getStatus())
                .append("\n");

        result.append("PREPARATION ITEMS:\n");

        if (items.isEmpty()) {

            result.append("No preparation items are available.\n");

            return result.toString();
        }

        for (PreparationPlanItem item : items) {

            result.append("- Skill: ")
                    .append(item.getSkill())
                    .append("\n");

            result.append("  Priority: ")
                    .append(item.getPriority())
                    .append("\n");

            result.append("  Status: ")
                    .append(item.getStatus())
                    .append("\n");

            result.append("  Description: ")
                    .append(
                            item.getDescription() != null
                                    ? item.getDescription()
                                    : "No description"
                    )
                    .append("\n");

            if (item.getTechnology() != null) {

                result.append("  Technology: ")
                        .append(
                                item.getTechnology().getName()
                        )
                        .append("\n");
            }
        }

        return result.toString();
    }
}