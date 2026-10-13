package com.careermetric.skill.service;

import com.careermetric.security.service.CurrentUserService;
import com.careermetric.skill.dto.SkillDashboardResponse;
import com.careermetric.skill.dto.SkillResponse;
import com.careermetric.skill.entity.ResumeTechnology;
import com.careermetric.skill.entity.TechnologyCategory;
import com.careermetric.skill.repository.ResumeTechnologyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SkillServiceImpl implements SkillService {

    private final ResumeTechnologyRepository resumeTechnologyRepository;
    private final CurrentUserService currentUserService;

    public SkillServiceImpl(
            ResumeTechnologyRepository resumeTechnologyRepository,
            CurrentUserService currentUserService
    ) {
        this.resumeTechnologyRepository =
                resumeTechnologyRepository;

        this.currentUserService =
                currentUserService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SkillResponse> getMySkills() {

        Long userId =
                currentUserService.getCurrentUserId();

        List<ResumeTechnology> resumeTechnologies =
                resumeTechnologyRepository
                        .findAllByResumeUserId(userId);

        /*
         * A technology can appear in multiple resumes.
         *
         * Example:
         *
         * Resume 1 -> Java
         * Resume 2 -> Java
         *
         * The API should return Java only once.
         */
        Map<Long, SkillResponse> skillsByTechnology =
                new LinkedHashMap<>();

        for (ResumeTechnology resumeTechnology
                : resumeTechnologies) {

            if (resumeTechnology.getTechnology() == null) {
                continue;
            }

            Long technologyId =
                    resumeTechnology
                            .getTechnology()
                            .getId();

            SkillResponse existingSkill =
                    skillsByTechnology.get(technologyId);

            if (existingSkill == null) {

                List<String> evidence =
                        createEvidenceList(
                                resumeTechnology.getEvidence()
                        );

                SkillResponse skillResponse =
                        new SkillResponse(
                                technologyId,
                                resumeTechnology
                                        .getTechnology()
                                        .getName(),
                                resumeTechnology
                                        .getTechnology()
                                        .getCategory(),
                                evidence
                        );

                skillsByTechnology.put(
                        technologyId,
                        skillResponse
                );

            } else {

                List<String> combinedEvidence =
                        new ArrayList<>(
                                existingSkill.evidence()
                        );

                addEvidence(
                        combinedEvidence,
                        resumeTechnology.getEvidence()
                );

                SkillResponse updatedSkill =
                        new SkillResponse(
                                existingSkill.technologyId(),
                                existingSkill.name(),
                                existingSkill.category(),
                                combinedEvidence
                        );

                skillsByTechnology.put(
                        technologyId,
                        updatedSkill
                );
            }
        }

        return new ArrayList<>(
                skillsByTechnology.values()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public SkillResponse getMySkill(Long technologyId) {

        Long userId =
                currentUserService.getCurrentUserId();

        List<ResumeTechnology> resumeTechnologies =
                resumeTechnologyRepository
                        .findAllByResumeUserId(userId);

        List<ResumeTechnology> matchingTechnologies =
                resumeTechnologies
                        .stream()
                        .filter(item ->
                                item.getTechnology() != null
                                        && item.getTechnology()
                                        .getId()
                                        .equals(technologyId)
                        )
                        .toList();

        if (matchingTechnologies.isEmpty()) {

            throw new IllegalArgumentException(
                    "Skill not found"
            );
        }

        ResumeTechnology first =
                matchingTechnologies.get(0);

        List<String> evidence =
                new ArrayList<>(
                        createEvidenceList(
                                first.getEvidence()
                        )
                );

        for (int i = 1;
             i < matchingTechnologies.size();
             i++) {

            addEvidence(
                    evidence,
                    matchingTechnologies
                            .get(i)
                            .getEvidence()
            );
        }

        return new SkillResponse(
                first.getTechnology().getId(),
                first.getTechnology().getName(),
                first.getTechnology().getCategory(),
                evidence
        );
    }

    @Override
    @Transactional(readOnly = true)
    public SkillDashboardResponse getMySkillDashboard() {

        List<SkillResponse> skills =
                getMySkills();

        /*
         * Start every category with zero.
         *
         * This gives the frontend a predictable structure,
         * even when a category has no skills.
         */
        Map<TechnologyCategory, Integer> categoryCounts =
                new EnumMap<>(TechnologyCategory.class);

        for (TechnologyCategory category
                : TechnologyCategory.values()) {

            categoryCounts.put(category, 0);
        }

        /*
         * Count unique technologies by category.
         */
        for (SkillResponse skill : skills) {

            if (skill.category() == null) {
                continue;
            }

            categoryCounts.merge(
                    skill.category(),
                    1,
                    Integer::sum
            );
        }

        return new SkillDashboardResponse(
                skills.size(),
                categoryCounts,
                skills
        );
    }

    private List<String> createEvidenceList(
            String evidence
    ) {

        if (evidence == null || evidence.isBlank()) {
            return new ArrayList<>();
        }

        return new ArrayList<>(
                List.of(evidence)
        );
    }

    private void addEvidence(
            List<String> evidenceList,
            String evidence
    ) {

        if (evidence == null || evidence.isBlank()) {
            return;
        }

        if (!evidenceList.contains(evidence)) {
            evidenceList.add(evidence);
        }
    }
}