package com.careermetric.resume.extraction;

import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
public class TikaResumeTextExtractionService
        implements ResumeTextExtractionService {

    private final Tika tika;

    public TikaResumeTextExtractionService() {
        this.tika = new Tika();
    }

    @Override
    public String extractText(MultipartFile file) {

        try (InputStream inputStream =
                     file.getInputStream()) {

            String extractedText =
                    tika.parseToString(inputStream);

            if (extractedText == null ||
                    extractedText.isBlank()) {

                throw new IllegalArgumentException(
                        "Could not extract text from resume"
                );
            }

            return extractedText.trim();

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Failed to extract text from resume",
                    exception
            );

        } catch (org.apache.tika.exception.TikaException exception) {

            throw new IllegalStateException(
                    "Failed to parse resume document",
                    exception
            );
        }
    }
}