package com.mydbs.backend.assignment.repository;

import com.mydbs.backend.assignment.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuizIdAndArchivedFalseOrderByOrderIndexAsc(Long quizId);
}
