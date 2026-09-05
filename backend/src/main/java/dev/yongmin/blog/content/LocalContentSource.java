package dev.yongmin.blog.content;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/** Reads index.mdx files from a mounted/checked-out directory (local dev, docker-compose). */
class LocalContentSource implements ContentSource {
    private final Path root;
    LocalContentSource(Path root) { this.root = root; }

    @Override
    public List<ContentFile> listIndexFiles() throws IOException {
        List<ContentFile> files = new ArrayList<>();
        for (String collection : List.of("blog", "jungle")) {
            Path directory = root.resolve(collection);
            if (!Files.isDirectory(directory)) throw new IOException("Missing content directory: " + directory);
            try (var entries = Files.list(directory)) {
                for (Path folder : entries.filter(Files::isDirectory).sorted().toList()) {
                    Path source = folder.resolve("index.mdx");
                    if (!Files.isRegularFile(source)) continue;
                    String text = Files.readString(source, StandardCharsets.UTF_8);
                    files.add(new ContentFile(collection, folder.getFileName().toString(), text));
                }
            }
        }
        return files;
    }
}
