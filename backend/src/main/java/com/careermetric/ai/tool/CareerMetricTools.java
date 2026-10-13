package com.careermetric.ai.tool;

import com.careermetric.job.dto.JobMatchRequest;
import com.careermetric.job.dto.JobMatchResponse;
import com.careermetric.job.dto.SkillGap;
import com.careermetric.job.service.JobMatchingService;
import com.careermetric.resume.entity.Resume;
import com.careermetric.skill.entity.ResumeTechnology;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CareerMetricTools {

    private final ToolService toolService;
    private final JobMatchingService jobMatchingService;

    public CareerMetricTools(
            ToolService toolService,
            JobMatchingService jobMatchingService
    ) {
        this.toolService = toolService;
        this.jobMatchingService = jobMatchingService;
    }

    @Tool(
            name = "get_current_user_resume_technologies",
            description = """
                    Get the technologies extracted from the authenticated
                    user's resume.

                    Use this tool when the user asks about:
                    - technologies in their resume
                    - their current technical stack
                    - technologies they have listed
                    - their extracted resume skills
                    """
    )
    public String getCurrentUserResumeTechnologies() {

        System.out.println(
                ">>> AI TOOL CALLED: get_current_user_resume_technologies"
        );

        List<ResumeTechnology> technologies =
                toolService.getCurrentUserResumeTechnologies();

        if (technologies.isEmpty()) {
            return "No technologies have been extracted from the user's resume.";
        }

        return technologies.stream()
                .map(resumeTechnology -> {

                    String technologyName =
                            resumeTechnology
                                    .getTechnology()
                                    .getName();

                    String evidence =
                            resumeTechnology.getEvidence();

                    if (evidence == null || evidence.isBlank()) {
                        return technologyName;
                    }

                    return technologyName
                            + " — Evidence: "
                            + evidence;
                })
                .collect(Collectors.joining("\n"));
    }

    @Tool(
            name = "get_current_user_resume_summary",
            description = """
                    Get the authenticated user's latest resume information.

                    Use this tool when the user asks to:
                    - summarize their resume
                    - describe their resume background
                    - identify projects or experience mentioned in their resume
                    - understand what their resume contains

                    Do not invent information that is not present
                    in the returned resume data.
                    """
    )
    public String getCurrentUserResumeSummary() {

        System.out.println(
                ">>> AI TOOL CALLED: get_current_user_resume_summary"
        );

        Resume resume =
                toolService.getCurrentUserLatestResume();

        if (resume == null) {
            return "No resume is available for the authenticated user.";
        }

        StringBuilder result = new StringBuilder();

        result.append("RESUME FILE: ")
                .append(resume.getFileName())
                .append("\n");

        result.append("FILE TYPE: ")
                .append(resume.getFileType())
                .append("\n");

        result.append("STATUS: ")
                .append(resume.getStatus())
                .append("\n");

        result.append("EXTRACTED RESUME TEXT:\n");

        String extractedText =
                resume.getExtractedText();

        if (extractedText == null || extractedText.isBlank()) {

            result.append(
                    "No extracted resume text is available."
            );

        } else {

            result.append(
                    limitText(extractedText, 12000)
            );
        }

        return result.toString();
    }

    @Tool(
            name = "match_current_user_resume_with_job",
            description = """
                    Match the authenticated user's resume against a
                    specific job description.

                    Use this tool when the user asks:
                    - how well their resume matches a job
                    - why their job match score is what it is
                    - what skills are missing for a job
                    - what required skills they have
                    - what preferred skills they have
                    - what skill gaps exist for a job

                    The resume ID and job description ID must refer to
                    resources accessible to the authenticated user.

                    The backend performs ownership validation.

                    Use the returned match score, matched skills,
                    missing skills, and skill gaps as the factual basis
                    for the answer. Do not invent missing skills.
                    """
    )
    public String matchCurrentUserResumeWithJob(
            Long resumeId,
            Long jobDescriptionId
    ) {

        System.out.println(
                ">>> AI TOOL CALLED: match_current_user_resume_with_job"
        );

        if (resumeId == null) {
            return "Resume ID is required.";
        }

        if (jobDescriptionId == null) {
            return "Job description ID is required.";
        }

        JobMatchRequest request =
                new JobMatchRequest(
                        resumeId,
                        jobDescriptionId
                );

        JobMatchResponse response =
                jobMatchingService.matchResumeWithJob(request);

        StringBuilder result = new StringBuilder();

        result.append("RESUME ID: ")
                .append(response.resumeId())
                .append("\n");

        result.append("JOB DESCRIPTION ID: ")
                .append(response.jobDescriptionId())
                .append("\n");

        result.append("MATCH SCORE: ")
                .append(response.matchScore())
                .append("%\n");

        result.append("MATCHED SKILLS:\n");

        appendList(
                result,
                response.matchedSkills()
        );

        result.append("MISSING REQUIRED SKILLS:\n");

        appendList(
                result,
                response.missingRequiredSkills()
        );

        result.append("MISSING PREFERRED SKILLS:\n");

        appendList(
                result,
                response.missingPreferredSkills()
        );

        result.append("SKILL GAPS:\n");

        if (response.skillGaps() == null
                || response.skillGaps().isEmpty()) {

            result.append("No skill gaps identified.\n");

        } else {

            response.skillGaps()
                    .forEach(skillGap -> {

                        result.append("- Skill: ")
                                .append(skillGap.skill())
                                .append("\n");

                        result.append("  Type: ")
                                .append(skillGap.type())
                                .append("\n");

                        result.append("  Importance: ")
                                .append(skillGap.importance())
                                .append("\n");

                        result.append("  Reason: ")
                                .append(skillGap.reason())
                                .append("\n");

                        if (skillGap.suggestedPreparation() != null
                                && !skillGap.suggestedPreparation().isEmpty()) {

                            result.append(
                                    "  Suggested Preparation:\n"
                            );

                            skillGap.suggestedPreparation()
                                    .forEach(item ->
                                            result.append("    - ")
                                                    .append(item)
                                                    .append("\n")
                                    );
                        }
                    });
        }

        return result.toString();
    }

    @Tool(
            name = "get_current_user_preparation_plan",
            description = """
                    Get the authenticated user's current preparation plan.

                    Use this tool when the user asks:
                    - what they should prepare next
                    - what is in their preparation plan
                    - what preparation items are pending
                    - what preparation items are in progress
                    - what preparation items are completed
                    - what skills they should work on

                    Use the returned preparation plan and item statuses
                    as the factual basis for the answer.

                    Do not invent preparation items, skills, priorities,
                    statuses, or recommendations that are not supported
                    by the returned plan.
                    """
    )
    public String getCurrentUserPreparationPlan() {

        System.out.println(
                ">>> AI TOOL CALLED: get_current_user_preparation_plan"
        );

        return toolService.getCurrentUserPreparationPlan();
    }

    private void appendList(
            StringBuilder result,
            List<String> values
    ) {

        if (values == null || values.isEmpty()) {

            result.append("None\n");

            return;
        }

        values.forEach(value ->
                result.append("- ")
                        .append(value)
                        .append("\n")
        );
    }

    private String limitText(
            String text,
            int maxLength
    ) {

        if (text.length() <= maxLength) {
            return text;
        }

        return text.substring(0, maxLength)
                + "\n[Resume text truncated by tool]";
    }
}