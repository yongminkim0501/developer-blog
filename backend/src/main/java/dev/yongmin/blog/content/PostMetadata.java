package dev.yongmin.blog.content;

import java.time.LocalDate;
import java.util.List;

public record PostMetadata(String slug, String title, String description, String category,
        List<String> tags, LocalDate date, String series, String project, Integer week,
        String collection, String hash) {}
