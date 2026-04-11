package com.mydbs.backend.course.service;

import com.mydbs.backend.course.dto.CourseResourceResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CourseResourceService {

    CourseResourceResponse upload(Long courseId,
                                  Long moduleId,
                                  Long lessonId,
                                  String title,
                                  String description,
                                  String visibility,
                                  MultipartFile file);

    List<CourseResourceResponse> getByCourse(Long courseId);

    Resource download(Long resourceId);

    CourseResourceResponse createExternalLink(Long courseId,
                                              Long moduleId,
                                              Long lessonId,
                                              String title,
                                              String description,
                                              String url,
                                              boolean videoLink,
                                              String visibility);

    void archive(Long id);

    Resource downloadByPath(String path);
}