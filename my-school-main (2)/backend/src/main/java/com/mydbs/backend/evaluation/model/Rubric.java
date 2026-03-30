package com.mydbs.backend.evaluation.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "rubric_criteria",
        indexes = {
                @Index(name = "idx_rubric_evaluation", columnList = "evaluation_id")
        })
public class Rubric extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evaluation_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_rubric_evaluation"))
    private Evaluation evaluation;

    @Column(name = "criterion_name", nullable = false, length = 200)
    private String criterionName;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "max_points", nullable = false)
    private Double maxPoints;

    @Column(name = "weight_percentage", nullable = false)
    private Double weightPercentage = 100.0;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    // Getters & Setters
    public Evaluation getEvaluation() { return evaluation; }
    public void setEvaluation(Evaluation evaluation) { this.evaluation = evaluation; }

    public String getCriterionName() { return criterionName; }
    public void setCriterionName(String criterionName) { this.criterionName = criterionName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getMaxPoints() { return maxPoints; }
    public void setMaxPoints(Double maxPoints) { this.maxPoints = maxPoints; }

    public Double getWeightPercentage() { return weightPercentage; }
    public void setWeightPercentage(Double weightPercentage) { this.weightPercentage = weightPercentage; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}
