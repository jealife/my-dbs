package com.mydbs.backend.assignment.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "questions",
        indexes = {
                @Index(name = "idx_question_quiz", columnList = "quiz_id"),
                @Index(name = "idx_question_order", columnList = "order_index")
        })
public class Question extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_question_quiz"))
    private Quiz quiz;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 20)
    private QuestionType questionType;

    @Column(name = "text", nullable = false, length = 2000)
    private String text;

    @Column(name = "explanation", length = 2000)
    private String explanation;

    @Column(name = "points", nullable = false)
    private Double points = 1.0;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    // For SHORT_ANSWER: expected answer for auto-grading (optional)
    @Column(name = "expected_answer", length = 500)
    private String expectedAnswer;

    // Getters & Setters
    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }
    public QuestionType getQuestionType() { return questionType; }
    public void setQuestionType(QuestionType questionType) { this.questionType = questionType; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public Double getPoints() { return points; }
    public void setPoints(Double points) { this.points = points; }
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
    public String getExpectedAnswer() { return expectedAnswer; }
    public void setExpectedAnswer(String expectedAnswer) { this.expectedAnswer = expectedAnswer; }
}
