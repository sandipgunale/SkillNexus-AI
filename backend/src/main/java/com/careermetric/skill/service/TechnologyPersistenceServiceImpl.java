package com.careermetric.skill.service;

import com.careermetric.ai.dto.ExtractedTechnology;
import com.careermetric.ai.dto.TechnologyExtractionAiResult;
import com.careermetric.resume.entity.Resume;
import com.careermetric.skill.entity.ResumeTechnology;
import com.careermetric.skill.entity.Technology;
import com.careermetric.skill.entity.TechnologyCategory;
import com.careermetric.skill.repository.ResumeTechnologyRepository;
import com.careermetric.skill.repository.TechnologyRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class TechnologyPersistenceServiceImpl
        implements TechnologyPersistenceService {

    private final TechnologyRepository technologyRepository;
    private final ResumeTechnologyRepository resumeTechnologyRepository;

    public TechnologyPersistenceServiceImpl(
            TechnologyRepository technologyRepository,
            ResumeTechnologyRepository resumeTechnologyRepository
    ) {
        this.technologyRepository = technologyRepository;
        this.resumeTechnologyRepository = resumeTechnologyRepository;
    }

    @Override
    @Transactional
    public void syncExtractedTechnologies(
            Resume resume,
            TechnologyExtractionAiResult extractionResult
    ) {

        if (resume == null || extractionResult == null) {
            return;
        }

        List<ExtractedTechnology> extractedTechnologies =
                extractionResult.technologies();

        /*
         * Re-analysis behavior:
         *
         * The resume_technologies table should represent
         * the CURRENT extraction result.
         *
         * Shared Technology records are not deleted.
         */
        resumeTechnologyRepository.deleteAllByResumeId(
                resume.getId()
        );

        if (extractedTechnologies == null
                || extractedTechnologies.isEmpty()) {
            return;
        }

        /*
         * Prevent duplicate technologies within the SAME AI result.
         *
         * Example:
         *
         * React
         * React.js
         *
         * both normalize to React.
         *
         * Or:
         *
         * JavaScript
         * JavaScript
         *
         * should only be persisted once.
         */
        Set<String> processedTechnologyNames = new HashSet<>();

        for (ExtractedTechnology extractedTechnology :
                extractedTechnologies) {

            if (extractedTechnology == null) {
                continue;
            }

            String technologyName =
                    normalizeTechnologyName(
                            extractedTechnology.name()
                    );

            if (technologyName == null) {
                continue;
            }

            /*
             * Skip duplicate technologies from the AI response.
             */
            if (!processedTechnologyNames.add(
                    technologyName.toLowerCase(Locale.ROOT)
            )) {
                continue;
            }

            TechnologyCategory category =
                    resolveCategory(
                            extractedTechnology.category()
                    );

            Technology technology =
                    technologyRepository
                            .findByNameIgnoreCase(technologyName)
                            .orElseGet(() ->
                                    createTechnology(
                                            technologyName,
                                            category
                                    )
                            );

            /*
             * Extra safety check.
             *
             * Even if the same relationship already exists in the
             * database, do not attempt to insert it again.
             */
            if (resumeTechnologyRepository
                    .existsByResumeIdAndTechnologyId(
                            resume.getId(),
                            technology.getId()
                    )) {
                continue;
            }

            ResumeTechnology resumeTechnology =
                    new ResumeTechnology();

            resumeTechnology.setResume(resume);
            resumeTechnology.setTechnology(technology);
            resumeTechnology.setEvidence(
                    buildEvidence(
                            extractedTechnology.evidence()
                    )
            );

            resumeTechnologyRepository.save(
                    resumeTechnology
            );
        }
    }

    private Technology createTechnology(
            String name,
            TechnologyCategory category
    ) {

        Technology technology = new Technology();

        technology.setName(name);
        technology.setCategory(category);

        return technologyRepository.save(technology);
    }

    private String normalizeTechnologyName(String name) {

        if (name == null || name.isBlank()) {
            return null;
        }

        String normalized =
                name
                        .trim()
                        .replaceAll("\\s+", " ");

        /*
         * Normalize common technology aliases.
         *
         * This prevents multiple Technology records for
         * the same underlying technology.
         */
        String lower =
                normalized.toLowerCase(Locale.ROOT);

        return switch (lower) {
            case "react.js", "reactjs" -> "React";
            case "html5" -> "HTML";
            case "css3" -> "CSS";
            case "restful api", "restful apis", "rest api" ->
                    "REST APIs";
            case "jwt authentication" -> "JWT";
            default -> normalized;
        };
    }

    private TechnologyCategory resolveCategory(
            String category
    ) {

        if (category == null || category.isBlank()) {
            return TechnologyCategory.OTHER;
        }

        try {
            return TechnologyCategory.valueOf(
                    category
                            .trim()
                            .toUpperCase(Locale.ROOT)
            );

        } catch (IllegalArgumentException exception) {

            return TechnologyCategory.OTHER;
        }
    }

    private String buildEvidence(
            List<String> evidence
    ) {

        if (evidence == null || evidence.isEmpty()) {
            return null;
        }

        return evidence.stream()
                .filter(item ->
                        item != null && !item.isBlank()
                )
                .map(String::trim)
                .reduce(
                        (first, second) ->
                                first + " | " + second
                )
                .orElse(null);
    }
}