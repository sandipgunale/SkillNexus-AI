package com.careermetric.resume.scoring;

import com.careermetric.ai.dto.ResumeAnalysisAiResult;
import com.careermetric.ai.dto.ResumeSectionAnalysis;
import com.careermetric.ai.dto.SectionEvaluation;
import com.careermetric.resume.dto.ScoreBreakdown;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ResumeScoringServiceImplTest {

    private final ResumeScoringServiceImpl scoringService =
            new ResumeScoringServiceImpl();


    // =========================================================
    // 1. STRONG RESUME
    // =========================================================

    @Test
    void shouldCalculateScoreForStrongResume() {

        String resumeText = """
                Goldi
                Java Full Stack Developer

                SUMMARY
                Java Full Stack Developer with experience building web applications.

                TECHNICAL SKILLS
                Java, Spring Boot, React, MySQL, REST API, JWT,
                Hibernate, Docker, Kafka, Redis

                PROJECTS
                CareerMetric AI - Built and developed a career intelligence
                platform using Java, Spring Boot, React and MySQL.
                Implemented REST APIs and optimized performance by 30%.

                PulseDrop - Developed a real-time delivery tracking application
                using Spring Boot, React, Kafka and Redis.

                EXPERIENCE
                Software Development Intern
                Developed REST APIs and implemented authentication.
                Improved application performance by 20%.

                EDUCATION
                B.Tech in Computer Science
                ABC University
                2024
                CGPA: 8.5

                • Developed backend services
                • Implemented JWT authentication
                """;

        ResumeAnalysisAiResult aiResult =
                createStrongAiResult();

        ResumeScoringResult result =
                scoringService.calculateScore(
                        resumeText,
                        aiResult
                );

        assertNotNull(result);
        assertNotNull(result.overallScore());
        assertNotNull(result.scoreBreakdown());

        assertTrue(
                result.overallScore() > 0,
                "Overall score should be greater than zero"
        );

        assertTrue(
                result.scoreBreakdown().skills() >= 70,
                "Strong resume should receive a strong skills score"
        );

        assertTrue(
                result.scoreBreakdown().projects() >= 70,
                "Strong resume should receive a strong projects score"
        );

        assertTrue(
                result.scoreBreakdown().experience() > 40,
                "Experience score should be above fresher baseline"
        );

        assertTrue(
                result.scoreBreakdown().education() > 40,
                "Education score should be above baseline"
        );

        assertTrue(
                result.scoreBreakdown().keywords() > 40,
                "Keyword score should be above baseline"
        );

        assertTrue(
                result.scoreBreakdown().structure() > 40,
                "Structure score should be above baseline"
        );

        assertTrue(
                result.scoreBreakdown().formatting() > 40,
                "Formatting score should be above baseline"
        );
    }


    // =========================================================
    // 2. EMPTY RESUME
    // =========================================================

    @Test
    void shouldHandleEmptyResume() {

        String resumeText = "";

        ResumeAnalysisAiResult aiResult =
                createEmptyAiResult();

        ResumeScoringResult result =
                scoringService.calculateScore(
                        resumeText,
                        aiResult
                );

        assertNotNull(result);
        assertNotNull(result.scoreBreakdown());

        assertEquals(
                40,
                result.scoreBreakdown().skills()
        );

        assertEquals(
                40,
                result.scoreBreakdown().projects()
        );

        assertEquals(
                40,
                result.scoreBreakdown().experience()
        );

        assertEquals(
                40,
                result.scoreBreakdown().education()
        );

        assertEquals(
                40,
                result.scoreBreakdown().keywords()
        );

        assertEquals(
                40,
                result.scoreBreakdown().structure()
        );

        assertEquals(
                40,
                result.scoreBreakdown().formatting()
        );

        assertEquals(
                40,
                result.overallScore()
        );
    }


    // =========================================================
    // 3. MISSING SECTIONS
    // =========================================================

    @Test
    void shouldGiveBaselineScoreWhenSectionsAreMissing() {

        String resumeText = """
                Goldi
                Java Developer
                Some basic resume content.
                """;

        ResumeAnalysisAiResult aiResult =
                createEmptyAiResult();

        ResumeScoringResult result =
                scoringService.calculateScore(
                        resumeText,
                        aiResult
                );

        ScoreBreakdown breakdown =
                result.scoreBreakdown();

        assertEquals(40, breakdown.skills());
        assertEquals(40, breakdown.projects());
        assertEquals(40, breakdown.experience());
        assertEquals(40, breakdown.education());
        assertEquals(40, breakdown.keywords());
        assertEquals(40, breakdown.structure());
        assertEquals(40, breakdown.formatting());

        assertEquals(
                40,
                result.overallScore()
        );
    }


    // =========================================================
    // 4. FRESHER WITH NO EXPERIENCE
    // =========================================================

    @Test
    void shouldGiveFresherBaselineForMissingExperience() {

        String resumeText = """
                TECHNICAL SKILLS
                Java, Spring Boot, React, MySQL

                PROJECTS
                CareerMetric AI
                Built a Java Spring Boot application.

                EDUCATION
                B.Tech in Computer Science
                ABC University
                2024
                """;

        ResumeAnalysisAiResult aiResult =
                createAiResultWithSections(
                        presentSection(
                                List.of(
                                        "Java",
                                        "Spring Boot",
                                        "React",
                                        "MySQL"
                                ),
                                "Strong technical skills"
                        ),
                        presentSection(
                                List.of(
                                        "CareerMetric AI"
                                ),
                                "Project demonstrates implementation"
                        ),
                        missingSection(),
                        presentSection(
                                List.of(
                                        "B.Tech",
                                        "ABC University"
                                ),
                                "Education is clearly provided"
                        ),
                        presentSection(
                                List.of(
                                        "Java",
                                        "Spring Boot"
                                ),
                                "Relevant keywords present"
                        ),
                        presentSection(
                                List.of(
                                        "Skills",
                                        "Projects",
                                        "Education"
                                ),
                                "Clear structure"
                        ),
                        presentSection(
                                List.of(
                                        "Skills",
                                        "Projects",
                                        "Education"
                                ),
                                "Readable formatting"
                        )
                );

        ResumeScoringResult result =
                scoringService.calculateScore(
                        resumeText,
                        aiResult
                );

        assertEquals(
                40,
                result.scoreBreakdown().experience()
        );
    }


    // =========================================================
    // 5. SINGLE PROJECT
    // =========================================================

    @Test
    void shouldScoreSingleProjectCorrectly() {

        String resumeText = """
                PROJECTS

                CareerMetric AI

                Built a career intelligence platform using
                Java and Spring Boot.

                Implemented REST APIs to solve career preparation
                problems.
                """;

        SectionEvaluation projects =
                presentSection(
                        List.of("CareerMetric AI"),
                        "One project is present"
                );

        ResumeAnalysisAiResult aiResult =
                createAiResultWithSections(
                        missingSection(),
                        projects,
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        missingSection()
                );

        ResumeScoringResult result =
                scoringService.calculateScore(
                        resumeText,
                        aiResult
                );

        int projectScore =
                result.scoreBreakdown().projects();

        assertTrue(
                projectScore >= 20,
                "Project score should be at least the base score"
        );

        assertTrue(
                projectScore <= 100,
                "Project score should never exceed 100"
        );
    }


    // =========================================================
    // 6. MULTIPLE PROJECTS
    // =========================================================

    @Test
    void shouldRewardMultipleProjects() {

        String resumeText = """
                PROJECTS

                CareerMetric AI
                Built and developed a career intelligence platform.

                PulseDrop
                Developed a real-time delivery tracking platform.

                Project technologies include Java, Spring Boot,
                React, Kafka and Redis.
                """;

        SectionEvaluation projects =
                presentSection(
                        List.of(
                                "CareerMetric AI",
                                "PulseDrop"
                        ),
                        "Multiple projects are present"
                );

        ResumeAnalysisAiResult aiResult =
                createAiResultWithSections(
                        missingSection(),
                        projects,
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        missingSection()
                );

        ResumeScoringResult result =
                scoringService.calculateScore(
                        resumeText,
                        aiResult
                );

        int projectScore =
                result.scoreBreakdown().projects();

        assertTrue(
                projectScore >= 70,
                "Multiple strong projects should receive a strong score"
        );

        assertTrue(
                projectScore <= 100,
                "Project score should never exceed 100"
        );
    }


    // =========================================================
    // 7. INTERNSHIP EXPERIENCE
    // =========================================================

    @Test
    void shouldRecognizeInternshipExperience() {

        String resumeText = """
                EXPERIENCE

                Java Developer Intern
                Developed Spring Boot REST APIs.
                Implemented authentication.
                Improved application performance.
                """;

        SectionEvaluation experience =
                presentSection(
                        List.of(
                                "Java Developer Intern",
                                "Developed REST APIs",
                                "Implemented authentication"
                        ),
                        "Candidate completed an internship."
                );

        ResumeAnalysisAiResult aiResult =
                createAiResultWithSections(
                        missingSection(),
                        missingSection(),
                        experience,
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        missingSection()
                );

        ResumeScoringResult result =
                scoringService.calculateScore(
                        resumeText,
                        aiResult
                );

        int experienceScore =
                result.scoreBreakdown().experience();

        assertTrue(
                experienceScore > 40,
                "Internship experience should score above fresher baseline"
        );

        assertTrue(
                experienceScore <= 100,
                "Experience score should never exceed 100"
        );
    }


    // =========================================================
    // 8. WEAK KEYWORDS
    // =========================================================

    @Test
    void shouldGiveLowerKeywordScoreForWeakKeywords() {

        String resumeText = """
                SUMMARY
                Hardworking and motivated individual.

                SKILLS
                Good communication
                Team player
                Quick learner
                """;

        SectionEvaluation keywords =
                presentSection(
                        List.of(
                                "hardworking",
                                "motivated"
                        ),
                        "Very few technical keywords."
                );

        ResumeAnalysisAiResult aiResult =
                createAiResultWithSections(
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        keywords,
                        missingSection(),
                        missingSection()
                );

        ResumeScoringResult result =
                scoringService.calculateScore(
                        resumeText,
                        aiResult
                );

        int keywordScore =
                result.scoreBreakdown().keywords();

        assertTrue(
                keywordScore <= 40,
                "Weak keyword resume should receive a low keyword score"
        );

        assertTrue(
                keywordScore >= 0,
                "Keyword score should not be negative"
        );
    }


    // =========================================================
    // 9. STRONG KEYWORDS
    // =========================================================

    @Test
    void shouldGiveHighKeywordScoreForStrongKeywords() {

        String resumeText = """
                Java Full Stack Developer

                Developed and implemented Spring Boot REST APIs.

                Built React web applications.

                Used MySQL, Hibernate, JPA and JWT authentication.

                Optimized application performance.

                Tested and deployed applications.
                """;

        SectionEvaluation keywords =
                presentSection(
                        List.of(
                                "Java",
                                "Spring Boot",
                                "REST API",
                                "React",
                                "MySQL",
                                "Hibernate",
                                "JPA",
                                "JWT"
                        ),
                        "Strong technical and role-relevant keywords."
                );

        ResumeAnalysisAiResult aiResult =
                createAiResultWithSections(
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        keywords,
                        missingSection(),
                        missingSection()
                );

        ResumeScoringResult result =
                scoringService.calculateScore(
                        resumeText,
                        aiResult
                );

        assertTrue(
                result.scoreBreakdown().keywords() >= 90,
                "Strong technical keywords should receive a high score"
        );
    }


    // =========================================================
    // 10. EDUCATION DETAILS
    // =========================================================

    @Test
    void shouldGiveHighEducationScoreForCompleteEducation() {

        String resumeText = """
                EDUCATION

                B.Tech in Computer Science
                ABC University
                2024
                CGPA: 8.5
                """;

        SectionEvaluation education =
                presentSection(
                        List.of(
                                "B.Tech",
                                "Computer Science",
                                "ABC University",
                                "2024"
                        ),
                        "Complete education details."
                );

        ResumeAnalysisAiResult aiResult =
                createAiResultWithSections(
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        education,
                        missingSection(),
                        missingSection(),
                        missingSection()
                );

        ResumeScoringResult result =
                scoringService.calculateScore(
                        resumeText,
                        aiResult
                );

        assertTrue(
                result.scoreBreakdown().education() >= 90,
                "Complete education should receive a high score"
        );
    }


    // =========================================================
    // 11. STRUCTURE SIGNALS
    // =========================================================

    @Test
    void shouldGiveHighStructureScoreForWellStructuredResume() {

        String resumeText = """
                SUMMARY
                Java Full Stack Developer.

                SKILLS
                Java, Spring Boot, React, MySQL.

                PROJECTS
                CareerMetric AI
                Built a career intelligence platform.

                EXPERIENCE
                Java Developer Intern
                Developed REST APIs.

                EDUCATION
                B.Tech in Computer Science.
                """;

        SectionEvaluation structure =
                presentSection(
                        List.of(
                                "SUMMARY",
                                "SKILLS",
                                "PROJECTS",
                                "EXPERIENCE",
                                "EDUCATION"
                        ),
                        "Resume has clear and logical sections."
                );

        ResumeAnalysisAiResult aiResult =
                createAiResultWithSections(
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        structure,
                        missingSection()
                );

        ResumeScoringResult result =
                scoringService.calculateScore(
                        resumeText,
                        aiResult
                );

        assertTrue(
                result.scoreBreakdown().structure() >= 90,
                "Well-structured resume should receive a high score"
        );
    }


    // =========================================================
    // 12. FORMATTING SIGNALS
    // =========================================================

    @Test
    void shouldGiveHighFormattingScoreForReadableResume() {

        String resumeText = """
                SUMMARY

                Java Full Stack Developer.

                SKILLS

                Java
                Spring Boot
                React
                MySQL

                PROJECTS

                CareerMetric AI

                • Developed backend services
                • Implemented REST APIs

                EDUCATION

                B.Tech in Computer Science
                ABC University
                2024
                """;

        SectionEvaluation formatting =
                presentSection(
                        List.of(
                                "consistent headings",
                                "consistent bullets",
                                "readable organization"
                        ),
                        "Formatting appears consistent."
                );

        ResumeAnalysisAiResult aiResult =
                createAiResultWithSections(
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        formatting
                );

        ResumeScoringResult result =
                scoringService.calculateScore(
                        resumeText,
                        aiResult
                );

        assertTrue(
                result.scoreBreakdown().formatting() >= 90,
                "Readable formatting should receive a high score"
        );
    }


    // =========================================================
    // 13. NULL EVIDENCE
    // =========================================================

    @Test
    void shouldHandleNullEvidence() {

        SectionEvaluation skills =
                new SectionEvaluation(
                        true,
                        "Skills section exists.",
                        null
                );

        ResumeAnalysisAiResult aiResult =
                createAiResultWithSections(
                        skills,
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        missingSection(),
                        missingSection()
                );

        assertDoesNotThrow(() ->
                scoringService.calculateScore(
                        "SKILLS\nJava\nSpring Boot",
                        aiResult
                )
        );

        ResumeScoringResult result =
                scoringService.calculateScore(
                        "SKILLS\nJava\nSpring Boot",
                        aiResult
                );

        assertNotNull(result);

        assertTrue(
                result.scoreBreakdown().skills() >= 20
        );
    }


    // =========================================================
    // 14. NULL SECTIONS
    // =========================================================

    @Test
    void shouldHandleNullSections() {

        ResumeSectionAnalysis sections =
                new ResumeSectionAnalysis(
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null
                );

        ResumeAnalysisAiResult aiResult =
                new ResumeAnalysisAiResult(
                        "Test summary",
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(),
                        sections
                );

        assertDoesNotThrow(() ->
                scoringService.calculateScore(
                        "Some resume text",
                        aiResult
                )
        );

        ResumeScoringResult result =
                scoringService.calculateScore(
                        "Some resume text",
                        aiResult
                );

        assertNotNull(result);
        assertNotNull(result.scoreBreakdown());

        /*
         * A null SectionEvaluation is treated as missing
         * and therefore receives the fresher-friendly
         * baseline score of 40.
         */
        assertEquals(
                40,
                result.scoreBreakdown().skills()
        );

        assertEquals(
                40,
                result.scoreBreakdown().projects()
        );

        assertEquals(
                40,
                result.scoreBreakdown().experience()
        );

        assertEquals(
                40,
                result.scoreBreakdown().education()
        );

        assertEquals(
                40,
                result.scoreBreakdown().keywords()
        );

        assertEquals(
                40,
                result.scoreBreakdown().structure()
        );

        assertEquals(
                40,
                result.scoreBreakdown().formatting()
        );

        assertEquals(
                40,
                result.overallScore()
        );
    }


    // =========================================================
    // 15. WEIGHTED OVERALL SCORE
    // =========================================================

    @Test
    void shouldCalculateWeightedOverallScore() {

        ResumeAnalysisAiResult aiResult =
                createAiResultWithSections(
                        presentSection(
                                List.of(),
                                "skills"
                        ),
                        presentSection(
                                List.of(),
                                "projects"
                        ),
                        presentSection(
                                List.of(),
                                "experience"
                        ),
                        presentSection(
                                List.of(),
                                "education"
                        ),
                        presentSection(
                                List.of(),
                                "keywords"
                        ),
                        presentSection(
                                List.of(),
                                "structure"
                        ),
                        presentSection(
                                List.of(),
                                "formatting"
                        )
                );

        ResumeScoringResult result =
                scoringService.calculateScore(
                        "resume",
                        aiResult
                );

        assertNotNull(result);

        assertTrue(
                result.overallScore() >= 0
        );

        assertTrue(
                result.overallScore() <= 100
        );
    }


    // =========================================================
    // 16. SCORE BOUNDARIES
    // =========================================================

    @Test
    void shouldKeepAllScoresWithinValidRange() {

        ResumeAnalysisAiResult aiResult =
                createStrongAiResult();

        ResumeScoringResult result =
                scoringService.calculateScore(
                        """
                        Strong resume with Java, Spring Boot,
                        React, MySQL projects and experience.
                        """,
                        aiResult
                );

        ScoreBreakdown breakdown =
                result.scoreBreakdown();

        assertScoreInRange(breakdown.skills());
        assertScoreInRange(breakdown.projects());
        assertScoreInRange(breakdown.experience());
        assertScoreInRange(breakdown.education());
        assertScoreInRange(breakdown.keywords());
        assertScoreInRange(breakdown.structure());
        assertScoreInRange(breakdown.formatting());

        assertScoreInRange(
                result.overallScore()
        );
    }


    // =========================================================
    // TEST HELPERS
    // =========================================================

    private void assertScoreInRange(
            Integer score
    ) {

        assertNotNull(score);

        assertTrue(
                score >= 0,
                "Score should not be below 0"
        );

        assertTrue(
                score <= 100,
                "Score should not exceed 100"
        );
    }


    private SectionEvaluation presentSection(
            List<String> evidence,
            String assessment
    ) {

        return new SectionEvaluation(
                true,
                assessment,
                evidence
        );
    }


    private SectionEvaluation missingSection() {

        return new SectionEvaluation(
                false,
                "",
                List.of()
        );
    }


    private ResumeAnalysisAiResult createStrongAiResult() {

        SectionEvaluation skills =
                presentSection(
                        List.of(
                                "Java",
                                "Spring Boot",
                                "React",
                                "MySQL",
                                "REST API",
                                "JWT",
                                "Hibernate",
                                "Docker",
                                "Kafka",
                                "Redis"
                        ),
                        "Strong and clearly grouped technical skills."
                );

        SectionEvaluation projects =
                presentSection(
                        List.of(
                                "CareerMetric AI",
                                "PulseDrop"
                        ),
                        "Projects clearly explain technologies, implementation and outcomes."
                );

        SectionEvaluation experience =
                presentSection(
                        List.of(
                                "Software Development Intern",
                                "Developed REST APIs",
                                "Implemented authentication",
                                "Improved performance"
                        ),
                        "Internship experience with clear responsibilities and achievements."
                );

        SectionEvaluation education =
                presentSection(
                        List.of(
                                "B.Tech",
                                "Computer Science",
                                "ABC University",
                                "2024"
                        ),
                        "Complete education details with academic achievement."
                );

        SectionEvaluation keywords =
                presentSection(
                        List.of(
                                "Java",
                                "Spring Boot",
                                "React",
                                "REST API",
                                "MySQL",
                                "Hibernate",
                                "JWT"
                        ),
                        "Strong technical and role-relevant keywords."
                );

        SectionEvaluation structure =
                presentSection(
                        List.of(
                                "Summary",
                                "Skills",
                                "Projects",
                                "Experience",
                                "Education"
                        ),
                        "Clear logical resume structure."
                );

        SectionEvaluation formatting =
                presentSection(
                        List.of(
                                "Consistent headings",
                                "Consistent bullets",
                                "Readable organization"
                        ),
                        "Readable and consistent formatting."
                );

        return createAiResultWithSections(
                skills,
                projects,
                experience,
                education,
                keywords,
                structure,
                formatting
        );
    }


    private ResumeAnalysisAiResult createEmptyAiResult() {

        return createAiResultWithSections(
                missingSection(),
                missingSection(),
                missingSection(),
                missingSection(),
                missingSection(),
                missingSection(),
                missingSection()
        );
    }


    private ResumeAnalysisAiResult createAiResultWithSections(
            SectionEvaluation skills,
            SectionEvaluation projects,
            SectionEvaluation experience,
            SectionEvaluation education,
            SectionEvaluation keywords,
            SectionEvaluation structure,
            SectionEvaluation formatting
    ) {

        ResumeSectionAnalysis sections =
                new ResumeSectionAnalysis(
                        skills,
                        projects,
                        experience,
                        education,
                        keywords,
                        structure,
                        formatting
                );

        return new ResumeAnalysisAiResult(
                "Resume analysis",
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                sections
        );
    }
}