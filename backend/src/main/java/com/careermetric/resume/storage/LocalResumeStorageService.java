package com.careermetric.resume.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class LocalResumeStorageService
        implements ResumeStorageService {

    private final Path storageRoot;

    public LocalResumeStorageService(
            @Value("${app.storage.resume-dir:storage/resumes}")
            String storageDirectory
    ) {
        this.storageRoot =
                Paths.get(storageDirectory)
                        .toAbsolutePath()
                        .normalize();
    }

    @Override
    public String store(
            MultipartFile file,
            Long userId
    ) {
        try {

            Path userDirectory =
                    storageRoot.resolve(
                            userId.toString()
                    );

            Files.createDirectories(
                    userDirectory
            );

            String originalFileName =
                    file.getOriginalFilename();

            String extension = "";

            if (originalFileName != null) {
                int dotIndex =
                        originalFileName.lastIndexOf('.');

                if (dotIndex >= 0) {
                    extension =
                            originalFileName.substring(
                                    dotIndex
                            ).toLowerCase();
                }
            }

            String storedFileName =
                    UUID.randomUUID()
                            + extension;

            Path targetPath =
                    userDirectory.resolve(
                            storedFileName
                    ).normalize();

            if (!targetPath.startsWith(userDirectory)) {
                throw new IllegalArgumentException(
                        "Invalid file path"
                );
            }

            try (InputStream inputStream =
                         file.getInputStream()) {

                Files.copy(
                        inputStream,
                        targetPath,
                        StandardCopyOption.REPLACE_EXISTING
                );
            }

            return storageRoot
                    .relativize(targetPath)
                    .toString()
                    .replace('\\', '/');

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Failed to store resume file",
                    exception
            );
        }
    }

    @Override
    public void delete(String filePath) {

        if (filePath == null || filePath.isBlank()) {
            return;
        }

        try {

            Path targetPath =
                    storageRoot
                            .resolve(filePath)
                            .normalize();

            if (!targetPath.startsWith(storageRoot)) {
                throw new IllegalArgumentException(
                        "Invalid file path"
                );
            }

            Files.deleteIfExists(targetPath);

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Failed to delete resume file",
                    exception
            );
        }
    }
}