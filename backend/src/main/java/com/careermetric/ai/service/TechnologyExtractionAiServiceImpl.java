package com.careermetric.ai.service;

import com.careermetric.ai.dto.TechnologyExtractionAiResult;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class TechnologyExtractionAiServiceImpl
        implements TechnologyExtractionAiService {

    private final ChatClient chatClient;

    public TechnologyExtractionAiServiceImpl(
            ChatClient chatClient
    ) {
        this.chatClient = chatClient;
    }

    @Override
    public TechnologyExtractionAiResult extractTechnologies(
            String resumeText
    ) {

        if (resumeText == null || resumeText.isBlank()) {
            throw new IllegalArgumentException(
                    "Resume text must not be blank"
            );
        }

        return chatClient
                .prompt()
                .system("""
                        You are a precise resume technology extraction engine.

                        Your task is to extract ALL technologies explicitly
                        mentioned or clearly demonstrated in the resume.

                        IMPORTANT:
                        - Do not extract only a few technologies.
                        - Review the ENTIRE resume before producing the result.
                        - Extract every distinct technology that is explicitly
                          supported by the resume.
                        - Never invent a technology.
                        - Never infer a technology only because another
                          technology commonly uses it.

                        Extract technologies from ALL relevant sections,
                        including:
                        - Professional Summary
                        - Skills
                        - Technical Stack
                        - Projects
                        - Experience
                        - Certifications
                        - Other technical sections

                        Examples of technologies that should be extracted
                        when explicitly present:

                        Programming languages:
                        Java, JavaScript, SQL

                        Backend:
                        Spring Boot, Spring Security, Spring Data JPA,
                        Hibernate, JDBC, REST APIs, WebSocket, STOMP

                        Frontend:
                        React, React.js, Vite, Tailwind CSS, React Router,
                        React Query, Axios

                        Databases:
                        MySQL, PostgreSQL

                        Security:
                        JWT, OAuth2

                        Testing:
                        JUnit, Mockito

                        Build tools:
                        Maven, Gradle

                        Version control:
                        Git, GitHub

                        DevOps / Cloud:
                        Docker, AWS, Vercel

                        AI / ML:
                        Spring AI, OpenAI, Gemini, Ollama

                        IMPORTANT NORMALIZATION RULES:
                        - Java and JavaScript are different technologies.
                        - SQL and MySQL are different.
                        - Spring and Spring Boot are different.
                        - React and React Query are different.
                        - HTML and CSS are different technologies.
                        - REST APIs are different from Spring Boot.
                        - JWT Authentication should be represented as JWT
                          or JWT Authentication consistently.
                        - React.js and React should be normalized to React.
                        - HTML5 should be normalized to HTML.
                        - CSS3 should be normalized to CSS.
                        - Spring Data JPA should remain distinct from JPA.
                        - GitHub should not replace Git.
                        - Do not merge unrelated technologies.

                        DO NOT extract:
                        - Soft skills
                        - Generic concepts
                        - Job responsibilities
                        - Education degrees
                        - Universities
                        - Personal qualities
                        - Generic words such as "backend", "frontend",
                          "database" unless they refer to a specific
                          technology.

                        Every extracted technology MUST have evidence.

                        The evidence should be a short exact or near-exact
                        phrase from the resume showing why the technology
                        was extracted.

                        Use ONLY these categories:

                        PROGRAMMING_LANGUAGE
                        BACKEND
                        FRONTEND
                        DATABASE
                        SECURITY
                        DEVOPS
                        CLOUD
                        TESTING
                        BUILD_TOOL
                        VERSION_CONTROL
                        AI_ML
                        OTHER

                        Return all supported technologies found in the
                        complete resume.
                        """)
                .user(user -> user
                        .text("""
                                Extract ALL technologies from the following
                                resume.

                                Carefully review the complete resume before
                                producing the final structured result.

                                Resume:
                                {resumeText}
                                """)
                        .param("resumeText", resumeText))
                .call()
                .entity(
                        TechnologyExtractionAiResult.class,
                        spec -> spec
                                .useProviderStructuredOutput()
                                .validateSchema()
                );
    }
}