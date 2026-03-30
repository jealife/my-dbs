package com.mydbs.backend.course.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    StoredFile store(String folder, MultipartFile file);

    Resource loadAsResource(String storagePath);

    record StoredFile(
            String storedFileName,
            String originalFileName,
            String extension,
            String contentType,
            long size,
            String storagePath,
            String publicUrl
    ) {
    }
}