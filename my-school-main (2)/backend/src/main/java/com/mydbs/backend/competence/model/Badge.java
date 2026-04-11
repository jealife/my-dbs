package com.mydbs.backend.competence.model;

import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

/** Badge = récompense numérique obtenue sur critères. */
@Entity
@Table(name = "badges",
        indexes = {
                @Index(name = "idx_badge_category", columnList = "category")
        })
public class Badge extends BaseAuditEntity {

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    @Column(name = "category", length = 100)
    private String category;  // ex: Excellence, Assiduité, Compétence, Projet

    @Column(name = "points", nullable = false)
    private int points = 0;

    /**
     * Critères d'attribution (format texte libre ou JSON) :
     * ex: {"type":"GRADE_AVERAGE","threshold":18}
     */
    @Column(name = "award_criteria", length = 1000)
    private String awardCriteria;

    @Column(name = "auto_award", nullable = false)
    private boolean autoAward = false;  // true = attribué automatiquement par le système

    // Getters & Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getIconUrl() { return iconUrl; }
    public void setIconUrl(String iconUrl) { this.iconUrl = iconUrl; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public String getAwardCriteria() { return awardCriteria; }
    public void setAwardCriteria(String awardCriteria) { this.awardCriteria = awardCriteria; }
    public boolean isAutoAward() { return autoAward; }
    public void setAutoAward(boolean autoAward) { this.autoAward = autoAward; }
}
