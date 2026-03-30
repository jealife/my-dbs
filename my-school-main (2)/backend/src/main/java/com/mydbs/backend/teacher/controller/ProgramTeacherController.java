package com.mydbs.backend.teacher.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.teacher.dto.TeacherResponse;
import com.mydbs.backend.teacher.service.TeacherService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/programs")
@CrossOrigin(origins = "*")
public class ProgramTeacherController {

    private final TeacherService teacherService;

    public ProgramTeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping("/{programId}/teachers")
    public ApiResponse<List<TeacherResponse>> getTeachersByProgram(@PathVariable Long programId) {
        return ApiResponse.success("Liste des enseignants du programme recuperee avec succes",
                teacherService.getByProgram(programId));
    }
}