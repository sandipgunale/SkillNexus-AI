package com.careermetric.assessment.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "assessment_id",
            nullable = false
    )
    private Assessment assessment;

    @Column(
            name = "question_text",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "question_type",
            nullable = false,
            length = 20
    )
    private QuestionType questionType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(
            name = "options",
            columnDefinition = "json"
    )
    private List<String> options;

    @Column(
            name = "correct_answer",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String correctAnswer;

    @Column(
            name = "explanation",
            columnDefinition = "TEXT"
    )
    private String explanation;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {

        createdAt =
                LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Assessment getAssessment() {
        return assessment;
    }

    public void setAssessment(
            Assessment assessment
    ) {
        this.assessment = assessment;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(
            String questionText
    ) {
        this.questionText = questionText;
    }

    public QuestionType getQuestionType() {
        return questionType;
    }

    public void setQuestionType(
            QuestionType questionType
    ) {
        this.questionType = questionType;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(
            List<String> options
    ) {
        this.options = options;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(
            String correctAnswer
    ) {
        this.correctAnswer = correctAnswer;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(
            String explanation
    ) {
        this.explanation = explanation;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}