package com.mydbs.backend.course.controller;

import com.mydbs.backend.common.response.ApiResponse;
import com.mydbs.backend.course.dto.CourseResourceResponse;
import com.mydbs.backend.course.service.CourseResourceService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/course-resources")
@CrossOrigin(origins = "*")
public class CourseResourceController {

    private final CourseResourceService courseResourceService;

    public CourseResourceController(CourseResourceService courseResourceService) {
        this.courseResourceService = courseResourceService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<CourseResourceResponse> upload(@RequestParam Long courseId,
                                                      @RequestParam(required = false) Long moduleId,
                                                      @RequestParam(required = false) Long lessonId,
                                                      @RequestParam(required = false) String title,
                                                      @RequestParam(required = false) String description,
                                                      @RequestParam(required = false) String visibility,
                                                      @RequestPart("file") MultipartFile file) {
        return ApiResponse.success(
                "Ressource uploadee avec succes",
                courseResourceService.upload(courseId, moduleId, lessonId, title, description, visibility, file)
        );
    }

    @PostMapping("/external-link")
    public ApiResponse<CourseResourceResponse> createExternalLink(@RequestParam Long courseId,
                                                                  @RequestParam(required = false) Long moduleId,
                                                                  @RequestParam(required = false) Long lessonId,
                                                                  @RequestParam String title,
                                                                  @RequestParam(required = false) String description,
                                                                  @RequestParam String url,
                                                                  @RequestParam(defaultValue = "false") boolean videoLink,
                                                                  @RequestParam(required = false) String visibility) {
        return ApiResponse.success(
                "Lien externe cree avec succes",
                courseResourceService.createExternalLink(courseId, moduleId, lessonId, title, description, url, videoLink, visibility)
        );
    }

    @GetMapping("/course/{courseId}")
    public ApiResponse<List<CourseResourceResponse>> getByCourse(@PathVariable Long courseId) {
        return ApiResponse.success("Liste des ressources recuperee avec succes", courseResourceService.getByCourse(courseId));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Resource resource = courseResourceService.download(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/download-by-path")
    public ResponseEntity<Resource> downloadByPath(@RequestParam String path) {
        Resource resource = courseResourceService.downloadByPath(path);
        // Better to detect media type, but for a quick fix we use application/octet-stream or guess
        String contentType = "application/octet-stream";
        if (path.toLowerCase().endsWith(".png")) contentType = "image/png";
        else if (path.toLowerCase().endsWith(".jpg") || path.toLowerCase().endsWith(".jpeg")) contentType = "image/jpeg";
        else if (path.toLowerCase().endsWith(".gif")) contentType = "image/gif";
        else if (path.toLowerCase().endsWith(".pdf")) contentType = "application/pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> archive(@PathVariable Long id) {
        courseResourceService.archive(id);
        return ApiResponse.success("Ressource archivee avec succes", null);
    }
}