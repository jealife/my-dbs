package com.mydbs.backend.student.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.student.dto.StudentResponse;
import com.mydbs.backend.student.service.StudentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "*")
public class ClassStudentController {

    private final StudentService studentService;

    public ClassStudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/{classId}/students")
    public ApiResponse<List<StudentResponse>> getStudentsByClass(@PathVariable Long classId) {
        return ApiResponse.success("Liste des etudiants de la classe recuperee avec succes",
                studentService.getByClassRoom(classId));
    }
}