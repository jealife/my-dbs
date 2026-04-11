package com.mydbs.backend.ue.model;

import com.mydbs.backend.academic.model.Program;
import com.mydbs.backend.common.model.BaseAuditEntity;
import jakarta.persistence.*;

/**
 * Unité d'Enseignement (UE) — niveau intermédiaire entre Programme et Cours.
 * Dans le système LMD, chaque programme est découpé en UE par semestre.
 * Chaque UE regroupe plusieurs cours (matières).
 */
@Entity
@Table(name = "teaching_units",
        indexes = {
                @Index(name = "idx_tu_program",  columnList = "program_id"),
                @Index(name = "idx_tu_semester", columnList = "semester"),
                @Index(name = "idx_tu_archived", columnList = "archived")
        })
public class TeachingUnit extends BaseAuditEntity {

    @Column(name = "code", nullable = false, length = 40)
    private String code;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", length = 1000)
    private String description;

    /** Semestre auquel appartient cette UE : S1, S2, S3, S4, S5, S6 */
    @Column(name = "semester", nullable = false, length = 10)
    private String semester;

    /** Ordre d'affichage dans le bulletin */
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 1;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "program_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_tu_program"))
    private Program program;

    public String getCode()                       { return code; }
    public void   setCode(String code)            { this.code = code; }
    public String getName()                       { return name; }
    public void   setName(String name)            { this.name = name; }
    public String getDescription()                { return description; }
    public void   setDescription(String d)        { this.description = d; }
    public String getSemester()                   { return semester; }
    public void   setSemester(String semester)    { this.semester = semester; }
    public Integer getOrderIndex()                { return orderIndex; }
    public void   setOrderIndex(Integer i)        { this.orderIndex = i; }
    public Program getProgram()                   { return program; }
    public void   setProgram(Program program)     { this.program = program; }
}
