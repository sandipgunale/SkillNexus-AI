package com.careermetric.job.service;

import com.careermetric.job.dto.SkillGap;
import com.careermetric.job.entity.JobRequirement;
import com.careermetric.job.entity.JobRequirementType;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SkillGapIntelligenceServiceImpl
        implements SkillGapIntelligenceService {

    @Override
    public SkillGap createSkillGap(
            JobRequirement requirement
    ) {

        String skill =
                requirement.getRequirement().trim();

        String type =
                requirement.getType().name();

        String importance =
                determineImportance(
                        requirement.getType()
                );

        String reason =
                buildReason(
                        skill,
                        requirement.getType()
                );

        List<String> resumeEvidence =
                List.of();

        List<String> suggestedPreparation =
                buildSuggestedPreparation(skill);

        return new SkillGap(
                skill,
                type,
                importance,
                reason,
                resumeEvidence,
                suggestedPreparation
        );
    }

    private String determineImportance(
            JobRequirementType type
    ) {

        if (type == JobRequirementType.REQUIRED) {
            return "HIGH";
        }

        return "MEDIUM";
    }

    private String buildReason(
            String skill,
            JobRequirementType type
    ) {

        if (type == JobRequirementType.REQUIRED) {

            return "This skill is explicitly required "
                    + "by the job description but was not "
                    + "found in the resume.";
        }

        return "This skill is preferred by the "
                + "job description but was not found "
                + "in the resume.";
    }

    private List<String> buildSuggestedPreparation(
            String skill
    ) {

        String normalizedSkill =
                skill.toLowerCase();

        return switch (normalizedSkill) {

            case "exception handling" ->
                    List.of(
                            "Understand checked and unchecked exceptions",
                            "Learn try-catch-finally",
                            "Learn throw and throws",
                            "Understand custom exceptions",
                            "Practice exception handling in Spring Boot REST APIs"
                    );

            case "collections" ->
                    List.of(
                            "Understand List, Set, and Map",
                            "Learn ArrayList, LinkedList, HashSet, and HashMap",
                            "Understand equals() and hashCode()",
                            "Practice common Collection Framework problems"
                    );

            case "multithreading" ->
                    List.of(
                            "Understand Thread and Runnable",
                            "Learn thread lifecycle",
                            "Understand synchronization",
                            "Learn ExecutorService",
                            "Practice concurrent programming concepts"
                    );

            case "object-oriented programming" ->
                    List.of(
                            "Understand encapsulation",
                            "Understand inheritance",
                            "Understand polymorphism",
                            "Understand abstraction",
                            "Practice SOLID and object-oriented design"
                    );

            case "database concepts" ->
                    List.of(
                            "Understand relational databases",
                            "Learn primary and foreign keys",
                            "Understand normalization",
                            "Practice SQL queries and joins",
                            "Understand transactions and indexing"
                    );

            default ->
                    List.of(
                            "Understand the fundamentals of "
                                    + skill,
                            "Practice the concept with "
                                    + "Java and Spring Boot",
                            "Solve practical interview problems "
                                    + "related to " + skill
                    );
        };
    }
}