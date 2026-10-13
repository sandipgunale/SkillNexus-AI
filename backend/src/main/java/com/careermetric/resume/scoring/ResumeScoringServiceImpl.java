package com.careermetric.resume.scoring;

import com.careermetric.ai.dto.ResumeAnalysisAiResult;
import com.careermetric.ai.dto.ResumeSectionAnalysis;
import com.careermetric.ai.dto.SectionEvaluation;
import com.careermetric.resume.dto.ScoreBreakdown;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class ResumeScoringServiceImpl implements ResumeScoringService {

    @Override
    public ResumeScoringResult calculateScore(
            String resumeText,
            ResumeAnalysisAiResult aiResult
    ) {

        ResumeSectionAnalysis sections = aiResult.sections();

        int skills = calculateSkillsScore(
                resumeText,
                sections.skills()
        );

        int projects = calculateProjectsScore(
                resumeText,
                sections.projects()
        );

        int experience = calculateExperienceScore(
                sections.experience()
        );

        int education = calculateEducationScore(
                resumeText,
                sections.education()
        );

        int keywords = calculateKeywordsScore(
                resumeText,
                sections.keywords()
        );

        int structure = calculateStructureScore(
                resumeText,
                sections.structure()
        );

        int formatting = calculateFormattingScore(
                resumeText,
                sections.formatting()
        );

        ScoreBreakdown breakdown = new ScoreBreakdown(
                skills,
                projects,
                experience,
                education,
                keywords,
                structure,
                formatting
        );

        int overallScore = calculateOverallScore(breakdown);

        return new ResumeScoringResult(
                overallScore,
                breakdown
        );
    }


    // =========================================================
    // SKILLS SCORING
    // =========================================================

    private int calculateSkillsScore(
            String resumeText,
            SectionEvaluation skills
    ) {

        if (skills == null || !skills.present()) {
            return 40;
        }

        int score = 20;

        int evidenceCount =
                skills.evidence() == null
                        ? 0
                        : skills.evidence().size();

        // At least 5 technical skills
        if (evidenceCount >= 5) {
            score += 15;
        }

        // At least 10 technical skills
        if (evidenceCount >= 10) {
            score += 10;
        }

        // Clearly grouped / useful assessment
        if (hasUsefulContent(skills.assessment())) {
            score += 15;
        }

        // Skills appear in resume content
        if (hasSkillEvidenceInResume(
                resumeText,
                skills.evidence()
        )) {
            score += 20;
        }

        // Skills appear multiple times / elsewhere
        if (hasMultipleSkillsInResume(
                resumeText,
                skills.evidence()
        )) {
            score += 10;
        }

        // No obvious duplicate/redundant skill listing.
        // For now, give the baseline 10 points.
        score += 10;

        return Math.min(score, 100);
    }


    // =========================================================
    // PROJECTS SCORING
    // =========================================================

    private int calculateProjectsScore(
            String resumeText,
            SectionEvaluation projects
    ) {

        /*
         * A fresher with no projects should not receive zero.
         * Baseline score = 40.
         */
        if (projects == null || !projects.present()) {
            return 40;
        }

        int score = 20;

        String text = normalize(resumeText);

        /*
         * At least one project with AI evidence.
         */
        if (projects.evidence() != null
                && !projects.evidence().isEmpty()) {

            score += 15;
        }

        /*
         * Technologies are mentioned in projects.
         */
        if (containsTechnologyEvidence(
                text,
                projects.evidence()
        )) {
            score += 15;
        }

        /*
         * Project explains a problem / use case.
         */
        if (containsProblemLanguage(text)) {
            score += 15;
        }

        /*
         * Project explains implementation.
         */
        if (containsImplementationLanguage(text)) {
            score += 15;
        }

        /*
         * Project contains some outcome / impact / performance
         * information.
         */
        if (containsOutcomeLanguage(text)) {
            score += 10;
        }

        /*
         * More than one project.
         */
        if (hasMultipleProjects(text)) {
            score += 10;
        }

        return Math.min(score, 100);
    }


    // =========================================================
    // EXPERIENCE SCORING
    // =========================================================

    private int calculateExperienceScore(
            SectionEvaluation experience
    ) {

        /*
         * Freshers should not be heavily punished for having
         * no professional experience.
         */
        if (experience == null || !experience.present()) {
            return 40;
        }

        /*
         * Relevant professional experience starts with 50.
         */
        int score = 50;

        String assessment =
                normalize(experience.assessment());

        List<String> evidence =
                experience.evidence();

        /*
         * Experience contains evidence.
         */
        if (evidence != null && !evidence.isEmpty()) {
            score += 20;
        }

        /*
         * Internship / volunteer / part-time experience.
         */
        if (containsInternshipEvidence(
                assessment,
                evidence
        )) {
            score += 10;
        }

        /*
         * Responsibilities are clearly described.
         */
        if (containsResponsibilityEvidence(
                assessment,
                evidence
        )) {
            score += 10;
        }

        /*
         * Achievements / measurable results are present.
         */
        if (containsAchievementEvidence(
                assessment,
                evidence
        )) {
            score += 10;
        }

        return Math.min(score, 100);
    }


    // =========================================================
    // EDUCATION SCORING
    // =========================================================

    private int calculateEducationScore(
            String resumeText,
            SectionEvaluation education
    ) {

        if (education == null || !education.present()) {
            return 40;
        }

        int score = 25;

        String text = normalize(resumeText);

        /*
         * Degree / course
         */
        if (containsAny(
                text,
                "b.tech",
                "btech",
                "b.e",
                "be ",
                "bachelor",
                "m.tech",
                "mtech",
                "mca",
                "master",
                "bca",
                "b.sc",
                "bsc",
                "m.sc",
                "msc",
                "diploma"
        )) {
            score += 20;
        }

        /*
         * Institution
         */
        if (containsAny(
                text,
                "university",
                "college",
                "institute",
                "school"
        )) {
            score += 15;
        }

        /*
         * Graduation / academic year
         */
        if (containsYear(text)) {
            score += 15;
        }

        /*
         * Relevant field
         */
        if (containsAny(
                text,
                "computer science",
                "information technology",
                "software engineering",
                "computer engineering",
                "information science",
                "engineering"
        )) {
            score += 15;
        }

        /*
         * Academic achievement
         */
        if (containsAny(
                text,
                "cgpa",
                "gpa",
                "percentage",
                "distinction",
                "rank",
                "scholarship",
                "academic achievement",
                "topper"
        )) {
            score += 10;
        }

        return Math.min(score, 100);
    }


    private boolean containsYear(String text) {

        if (text == null || text.isBlank()) {
            return false;
        }

        return text.matches(
                "(?s).*\\b(19|20)\\d{2}\\b.*"
        );
    }


    // =========================================================
    // KEYWORDS SCORING
    // =========================================================

    private int calculateKeywordsScore(
            String resumeText,
            SectionEvaluation keywords
    ) {

        if (keywords == null || !keywords.present()) {
            return 40;
        }

        int score = 25;

        String text = normalize(resumeText);

        /*
         * Technical terminology
         */
        if (containsTechnicalContent(text)) {
            score += 25;
        }

        /*
         * Role-relevant terminology
         */
        if (containsAny(
                text,
                "java developer",
                "backend developer",
                "full stack developer",
                "software developer",
                "software engineer",
                "spring boot",
                "rest api",
                "restful api",
                "web application"
        )) {
            score += 20;
        }

        /*
         * Action verbs
         */
        if (containsAny(
                text,
                "developed",
                "built",
                "implemented",
                "designed",
                "created",
                "integrated",
                "optimized",
                "deployed",
                "tested",
                "maintained"
        )) {
            score += 20;
        }

        /*
         * Multiple technical terms
         */
        if (hasMultipleTechnicalTerms(text)) {
            score += 15;
        }

        /*
         * Domain terminology
         */
        if (containsAny(
                text,
                "api",
                "database",
                "authentication",
                "authorization",
                "security",
                "performance",
                "scalability",
                "testing",
                "deployment"
        )) {
            score += 10;
        }

        /*
         * We currently don't apply a penalty for generic buzzwords.
         * This can be refined later using AI analysis.
         */
        score += 5;

        return Math.min(score, 100);
    }


    private boolean containsTechnicalContent(
            String resumeText
    ) {

        String text = normalize(resumeText);

        return containsAny(
                text,
                "java",
                "javascript",
                "typescript",
                "spring",
                "spring boot",
                "react",
                "angular",
                "node",
                "python",
                "sql",
                "mysql",
                "postgresql",
                "mongodb",
                "hibernate",
                "jpa",
                "docker",
                "kafka",
                "redis",
                "git",
                "github",
                "rest",
                "jwt",
                "html",
                "css"
        );
    }


    private boolean hasMultipleTechnicalTerms(
            String resumeText
    ) {

        String text = normalize(resumeText);

        String[] technicalTerms = {
                "java",
                "javascript",
                "spring",
                "spring boot",
                "react",
                "sql",
                "mysql",
                "postgresql",
                "hibernate",
                "jpa",
                "docker",
                "kafka",
                "redis",
                "git",
                "jwt",
                "rest api"
        };

        int matches = 0;

        for (String term : technicalTerms) {

            if (text.contains(term)) {
                matches++;
            }
        }

        return matches >= 3;
    }


    // =========================================================
    // STRUCTURE SCORING
    // =========================================================

    private int calculateStructureScore(
            String resumeText,
            SectionEvaluation structure
    ) {

        if (structure == null || !structure.present()) {
            return 40;
        }

        int score = 20;

        String text = normalize(resumeText);

        /*
         * Clear section structure
         */
        if (hasResumeSection(text)) {
            score += 20;
        }

        /*
         * Logical ordering
         */
        if (hasLogicalSectionCombination(text)) {
            score += 20;
        }

        /*
         * Important sections identifiable
         */
        if (hasImportantSections(text)) {
            score += 20;
        }

        /*
         * Consistent section naming
         */
        if (hasConsistentSectionNaming(text)) {
            score += 10;
        }

        /*
         * Easy to scan
         */
        if (hasScannableStructure(text)) {
            score += 10;
        }

        return Math.min(score, 100);
    }


    private boolean hasResumeSection(
            String text
    ) {

        return containsAny(
                text,
                "skills",
                "technical skills",
                "projects",
                "education",
                "experience",
                "work experience",
                "internship",
                "summary",
                "profile"
        );
    }


    private boolean hasLogicalSectionCombination(
            String text
    ) {

        int sectionCount = 0;

        if (containsAny(
                text,
                "summary",
                "profile"
        )) {
            sectionCount++;
        }

        if (containsAny(
                text,
                "skills",
                "technical skills"
        )) {
            sectionCount++;
        }

        if (containsAny(
                text,
                "projects"
        )) {
            sectionCount++;
        }

        if (containsAny(
                text,
                "experience",
                "work experience"
        )) {
            sectionCount++;
        }

        if (containsAny(
                text,
                "education"
        )) {
            sectionCount++;
        }

        return sectionCount >= 3;
    }


    private boolean hasImportantSections(
            String text
    ) {

        int count = 0;

        if (containsAny(
                text,
                "skills",
                "technical skills"
        )) {
            count++;
        }

        if (containsAny(
                text,
                "projects"
        )) {
            count++;
        }

        if (containsAny(
                text,
                "education"
        )) {
            count++;
        }

        if (containsAny(
                text,
                "experience",
                "work experience",
                "internship"
        )) {
            count++;
        }

        return count >= 3;
    }


    private boolean hasConsistentSectionNaming(
            String text
    ) {

        return hasResumeSection(text);
    }


    private boolean hasScannableStructure(
            String text
    ) {

        if (text == null || text.isBlank()) {
            return false;
        }

        boolean hasBullets =
                text.contains("•")
                        || text.contains("- ")
                        || text.contains("* ");

        boolean hasSections =
                hasResumeSection(text);

        return hasBullets && hasSections;
    }


    // =========================================================
    // FORMATTING SCORING
    // =========================================================

    private int calculateFormattingScore(
            String resumeText,
            SectionEvaluation formatting
    ) {

        if (formatting == null || !formatting.present()) {
            return 40;
        }

        int score = 20;

        String text = normalize(resumeText);

        /*
         * Consistent headings
         */
        if (hasResumeSection(text)) {
            score += 20;
        }

        /*
         * Consistent bullet style
         */
        if (hasConsistentBulletStyle(resumeText)) {
            score += 20;
        }

        /*
         * Consistent date formatting
         */
        if (hasConsistentDateFormatting(text)) {
            score += 15;
        }

        /*
         * Readable text organization
         */
        if (hasReadableOrganization(text)) {
            score += 15;
        }

        /*
         * No obvious formatting artifacts
         */
        if (!hasFormattingArtifacts(text)) {
            score += 10;
        }

        return Math.min(score, 100);
    }


    private boolean hasConsistentBulletStyle(
            String resumeText
    ) {

        if (resumeText == null || resumeText.isBlank()) {
            return false;
        }

        boolean bullet =
                resumeText.contains("•");

        boolean dash =
                resumeText.contains("- ");

        boolean star =
                resumeText.contains("* ");

        int styles = 0;

        if (bullet) {
            styles++;
        }

        if (dash) {
            styles++;
        }

        if (star) {
            styles++;
        }

        /*
         * No obvious bullet mixing.
         */
        return styles <= 1;
    }


    private boolean hasConsistentDateFormatting(
            String text
    ) {

        if (text == null || text.isBlank()) {
            return false;
        }

        boolean hasYear =
                text.matches(
                        "(?s).*\\b(19|20)\\d{2}\\b.*"
                );

        boolean hasMonth =
                containsAny(
                        text,
                        "january",
                        "february",
                        "march",
                        "april",
                        "may",
                        "june",
                        "july",
                        "august",
                        "september",
                        "october",
                        "november",
                        "december",
                        "jan",
                        "feb",
                        "mar",
                        "apr",
                        "jun",
                        "jul",
                        "aug",
                        "sep",
                        "oct",
                        "nov",
                        "dec"
                );

        return hasYear || hasMonth;
    }


    private boolean hasReadableOrganization(
            String text
    ) {

        if (text == null || text.isBlank()) {
            return false;
        }

        String[] sections = {
                "summary",
                "skills",
                "projects",
                "experience",
                "education"
        };

        int matches = 0;

        for (String section : sections) {

            if (text.contains(section)) {
                matches++;
            }
        }

        return matches >= 3;
    }


    private boolean hasFormattingArtifacts(
            String text
    ) {

        if (text == null || text.isBlank()) {
            return true;
        }

        return text.contains("�")
                || text.contains("???")
                || text.contains("\u0000");
    }


    // =========================================================
    // SKILLS HELPERS
    // =========================================================

    private boolean hasSkillEvidenceInResume(
            String resumeText,
            List<String> evidence
    ) {

        if (resumeText == null
                || resumeText.isBlank()
                || evidence == null
                || evidence.isEmpty()) {

            return false;
        }

        String normalizedResume =
                normalize(resumeText);

        return evidence.stream()
                .filter(Objects::nonNull)
                .anyMatch(skill ->
                        normalizedResume.contains(
                                normalize(skill)
                        )
                );
    }


    private boolean hasMultipleSkillsInResume(
            String resumeText,
            List<String> evidence
    ) {

        if (resumeText == null
                || evidence == null
                || evidence.isEmpty()) {

            return false;
        }

        String normalizedResume =
                normalize(resumeText);

        long matches = evidence.stream()
                .filter(Objects::nonNull)
                .filter(skill ->
                        normalizedResume.contains(
                                normalize(skill)
                        )
                )
                .count();

        return matches >= 3;
    }


    // =========================================================
    // PROJECT HELPERS
    // =========================================================

    private boolean containsTechnologyEvidence(
            String resumeText,
            List<String> evidence
    ) {

        if (resumeText == null
                || resumeText.isBlank()
                || evidence == null
                || evidence.isEmpty()) {

            return false;
        }

        String normalizedResume =
                normalize(resumeText);

        return evidence.stream()
                .filter(Objects::nonNull)
                .anyMatch(skill ->
                        normalizedResume.contains(
                                normalize(skill)
                        )
                );
    }


    private boolean containsProblemLanguage(
            String resumeText
    ) {

        String text = normalize(resumeText);

        return text.contains("problem")
                || text.contains("solution")
                || text.contains("use case")
                || text.contains("purpose")
                || text.contains("designed to")
                || text.contains("built to")
                || text.contains("developed to");
    }


    private boolean containsImplementationLanguage(
            String resumeText
    ) {

        String text = normalize(resumeText);

        return text.contains("built")
                || text.contains("developed")
                || text.contains("implemented")
                || text.contains("designed")
                || text.contains("created")
                || text.contains("integrated")
                || text.contains("develop")
                || text.contains("implement");
    }


    private boolean containsOutcomeLanguage(
            String resumeText
    ) {

        String text = normalize(resumeText);

        return text.contains("%")
                || text.contains("improved")
                || text.contains("reduced")
                || text.contains("increased")
                || text.contains("optimized")
                || text.contains("optimization")
                || text.contains("performance")
                || text.contains("users")
                || text.contains("faster")
                || text.contains("efficiency")
                || text.contains("scalable");
    }


    private boolean hasMultipleProjects(
            String resumeText
    ) {

        return countOccurrences(
                normalize(resumeText),
                "project"
        ) >= 2;
    }


    private int countOccurrences(
            String text,
            String value
    ) {

        if (text == null
                || text.isBlank()
                || value == null
                || value.isBlank()) {

            return 0;
        }

        int count = 0;
        int index = 0;

        while ((index = text.indexOf(value, index)) != -1) {
            count++;
            index += value.length();
        }

        return count;
    }


    // =========================================================
    // EXPERIENCE HELPERS
    // =========================================================

    private boolean containsInternshipEvidence(
            String assessment,
            List<String> evidence
    ) {

        if (containsAny(
                assessment,
                "intern",
                "internship",
                "trainee",
                "volunteer",
                "part-time",
                "part time"
        )) {
            return true;
        }

        return containsAnyInEvidence(
                evidence,
                "intern",
                "internship",
                "trainee",
                "volunteer",
                "part-time",
                "part time"
        );
    }


    private boolean containsResponsibilityEvidence(
            String assessment,
            List<String> evidence
    ) {

        if (containsAny(
                assessment,
                "responsible",
                "responsibility",
                "managed",
                "developed",
                "implemented",
                "built",
                "maintained",
                "designed",
                "worked on",
                "contributed"
        )) {
            return true;
        }

        return containsAnyInEvidence(
                evidence,
                "responsible",
                "responsibility",
                "managed",
                "developed",
                "implemented",
                "built",
                "maintained",
                "designed",
                "worked on",
                "contributed"
        );
    }


    private boolean containsAchievementEvidence(
            String assessment,
            List<String> evidence
    ) {

        if (containsAny(
                assessment,
                "%",
                "improved",
                "increased",
                "reduced",
                "optimized",
                "achievement",
                "award",
                "award-winning",
                "performance",
                "result",
                "impact",
                "success"
        )) {
            return true;
        }

        return containsAnyInEvidence(
                evidence,
                "%",
                "improved",
                "increased",
                "reduced",
                "optimized",
                "achievement",
                "award",
                "award-winning",
                "performance",
                "result",
                "impact",
                "success"
        );
    }


    // =========================================================
    // COMMON HELPERS
    // =========================================================

    private boolean containsAny(
            String text,
            String... values
    ) {

        if (text == null || text.isBlank()) {
            return false;
        }

        String normalizedText =
                normalize(text);

        for (String value : values) {

            if (normalizedText.contains(
                    normalize(value)
            )) {
                return true;
            }
        }

        return false;
    }


    private boolean containsAnyInEvidence(
            List<String> evidence,
            String... values
    ) {

        if (evidence == null
                || evidence.isEmpty()) {

            return false;
        }

        for (String item : evidence) {

            if (item == null) {
                continue;
            }

            if (containsAny(item, values)) {
                return true;
            }
        }

        return false;
    }


    private boolean hasUsefulContent(
            String text
    ) {

        return text != null
                && !text.isBlank();
    }


    private String normalize(
            String text
    ) {

        if (text == null) {
            return "";
        }

        return text
                .toLowerCase()
                .trim();
    }


    // =========================================================
    // OVERALL SCORE
    // =========================================================

    private int calculateOverallScore(
            ScoreBreakdown score
    ) {

        double weightedScore =
                score.skills() * 0.20
                        + score.projects() * 0.20
                        + score.experience() * 0.10
                        + score.education() * 0.10
                        + score.keywords() * 0.15
                        + score.structure() * 0.15
                        + score.formatting() * 0.10;

        return (int) Math.round(weightedScore);
    }
}