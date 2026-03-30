package com.mydbs.backend.course.service.impl;

import com.mydbs.backend.common.exception.FileStorageException;
import com.mydbs.backend.config.StorageProperties;
import com.mydbs.backend.course.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Objects;
import java.util.UUID;

@Service
public class LocalFileStorageServiceImpl implements FileStorageService {

    private final Path rootPath;
    private final StorageProperties storageProperties;

    public LocalFileStorageServiceImpl(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
        this.rootPath = Paths.get(storageProperties.getLocal().getBaseDir()).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.rootPath);
        } catch (IOException ex) {
            throw new FileStorageException("Impossible d'initialiser le dossier de stockage", ex);
        }
    }

    @Override
    public StoredFile store(String folder, MultipartFile file) {
        try {
            String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename(), "Nom de fichier introuvable"));
            if (originalFileName.contains("..")) {
                throw new FileStorageException("Nom de fichier invalide");
            }

            String extension = "";
            int lastDotIndex = originalFileName.lastIndexOf('.');
            if (lastDotIndex >= 0) {
                extension = originalFileName.substring(lastDotIndex + 1);
            }

            String storedFileName = UUID.randomUUID() + (extension.isBlank() ? "" : "." + extension);
            Path targetFolder = rootPath.resolve(folder).normalize();
            Files.createDirectories(targetFolder);

            Path targetFile = targetFolder.resolve(storedFileName).normalize();
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);

            String relativePath = rootPath.relativize(targetFile).toString().replace("\\", "/");
            String publicUrl = storageProperties.getPublicBaseUrl() + "/api/course-resources/download-by-path?path=" + relativePath;

            return new StoredFile(
                    storedFileName,
                    originalFileName,
                    extension,
                    file.getContentType(),
                    file.getSize(),
                    relativePath,
                    publicUrl
            );
        } catch (IOException ex) {
            throw new FileStorageException("Erreur lors du stockage du fichier", ex);
        }
    }

    @Override
    public Resource loadAsResource(String storagePath) {
        try {
            Path filePath = rootPath.resolve(storagePath).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                throw new FileStorageException("Fichier introuvable");
            }
            return resource;
        } catch (MalformedURLException ex) {
            throw new FileStorageException("Impossible de charger le fichier", ex);
        }
    }
}