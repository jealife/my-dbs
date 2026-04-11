package com.mydbs.backend.assignment.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "choices",
        indexes = {
                @Index(name = "idx_choice_question", columnList = "question_id")
        })
public class Choice extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_choice_question"))
    private Question question;

    @Column(name = "text", nullable = false, length = 1000)
    private String text;

    @Column(name = "is_correct", nullable = false)
    private boolean correct = false;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    // Getters & Setters
    public Question getQuestion() { return question; }
    public void setQuestion(Question question) { this.question = question; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}
