package com.mydbs.backend.course.model;

import com.mydbs.backend.user.model.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_lesson_progress",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_student_lesson", columnNames = {"user_id", "lesson_id"})
        },
        indexes = {
                @Index(name = "idx_slp_user_course", columnList = "user_id, course_id")
        })
@EntityListeners(AuditingEntityListener.class)
public class StudentLessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_slp_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_slp_lesson"))
    private Lesson lesson;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_slp_course"))
    private Course course;

    @CreatedDate
    @Column(name = "completed_at", nullable = false, updatable = false)
    private LocalDateTime completedAt;

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Lesson getLesson() { return lesson; }
    public Course getCourse() { return course; }
    public LocalDateTime getCompletedAt() { return completedAt; }

    public void setUser(User user) { this.user = user; }
    public void setLesson(Lesson lesson) { this.lesson = lesson; }
    public void setCourse(Course course) { this.course = course; }
}
