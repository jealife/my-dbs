package com.mydbs.backend.course.util;

import com.mydbs.backend.course.model.MediaCategory;
import com.mydbs.backend.course.model.ResourceType;

import java.util.Set;

public final class FileTypeUtils {

    private static final Set<String> DOCUMENT_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "csv", "zip", "rar"
    );

    private FileTypeUtils() {
    }

    public static MediaCategory resolveCategory(String contentType, String extension) {
        if (contentType != null && contentType.startsWith("image/")) {
            return MediaCategory.IMAGE;
        }
        if (contentType != null && contentType.startsWith("video/")) {
            return MediaCategory.VIDEO;
        }
        if (extension != null && DOCUMENT_EXTENSIONS.contains(extension.toLowerCase())) {
            return MediaCategory.DOCUMENT;
        }
        return MediaCategory.OTHER;
    }

    public static ResourceType resolveResourceType(MediaCategory category) {
        return switch (category) {
            case IMAGE -> ResourceType.IMAGE;
            case VIDEO -> ResourceType.VIDEO;
            case DOCUMENT -> ResourceType.DOCUMENT;
            default -> ResourceType.FILE;
        };
    }

    public static boolean isSupported(String contentType, String extension) {
        if (contentType != null && (contentType.startsWith("image/") || contentType.startsWith("video/"))) {
            return true;
        }
        return extension != null && DOCUMENT_EXTENSIONS.contains(extension.toLowerCase());
    }
}