package com.mydbs.backend.grades.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

/**
 * GradeItem = une note individuelle dans un GradeBook.
 * Peut être liée à une Evaluation, un Assignment, ou être manuelle.
 */
@Entity
@Table(name = "grade_items",
        indexes = {
                @Index(name = "idx_gradeitem_gradebook", columnList = "grade_book_id"),
                @Index(name = "idx_gradeitem_type", columnList = "item_type"),
                @Index(name = "idx_gradeitem_source", columnList = "source_id")
        })
public class GradeItem extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "grade_book_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_gradeitem_gradebook"))
    private GradeBook gradeBook;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false, length = 20)
    private GradeItemType itemType;

    /** ID de l'entité source (Evaluation.id, Assignment.id, Attempt.id) */
    @Column(name = "source_id")
    private Long sourceId;

    @Column(name = "label", nullable = false, length = 200)
    private String label;

    @Column(name = "score", nullable = false)
    private Double score;

    @Column(name = "max_score", nullable = false)
    private Double maxScore = 20.0;

    @Column(name = "semester", length = 20)
    private String semester;

    @Column(name = "teacher_comment", length = 500)
    private String teacherComment;

    // Getters & Setters
    public GradeBook getGradeBook() { return gradeBook; }
    public void setGradeBook(GradeBook gradeBook) { this.gradeBook = gradeBook; }
    public GradeItemType getItemType() { return itemType; }
    public void setItemType(GradeItemType itemType) { this.itemType = itemType; }
    public Long getSourceId() { return sourceId; }
    public void setSourceId(Long sourceId) { this.sourceId = sourceId; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }
    public Double getMaxScore() { return maxScore; }
    public void setMaxScore(Double maxScore) { this.maxScore = maxScore; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public String getTeacherComment() { return teacherComment; }
    public void setTeacherComment(String teacherComment) { this.teacherComment = teacherComment; }
}
