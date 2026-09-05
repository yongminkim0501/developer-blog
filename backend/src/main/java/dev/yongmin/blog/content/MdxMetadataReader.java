package dev.yongmin.blog.content;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.LoaderOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.SafeConstructor;

@Component
public class MdxMetadataReader {
    private final Path root;
    public MdxMetadataReader(@Value("${blog.content-root}") String root) { this.root = Path.of(root); }

    // Build a complete valid snapshot before touching the database. A broken mount or
    // malformed document must not silently remove the existing index.
    public List<PostMetadata> readPublished() throws IOException {
        List<PostMetadata> result = new ArrayList<>();
        Set<String> slugs = new HashSet<>();
        for (String collection : List.of("blog", "jungle")) {
            Path directory = root.resolve(collection);
            if (!Files.isDirectory(directory)) throw new IOException("Missing content directory: " + directory);
            try (var entries = Files.list(directory)) {
                for (Path folder : entries.filter(Files::isDirectory).sorted().toList()) {
                    Path source = folder.resolve("index.mdx");
                    if (!Files.isRegularFile(source)) continue;
                    String slug = folder.getFileName().toString();
                    if (!slug.matches("[a-z0-9][a-z0-9-]{0,159}")) throw invalid(source, "invalid slug");
                    if (!slugs.add(slug)) throw invalid(source, "duplicate blog/jungle slug");
                    String text = Files.readString(source, StandardCharsets.UTF_8).replace("\r\n", "\n");
                    if (text.startsWith("\ufeff")) text = text.substring(1);
                    if (!text.startsWith("---\n")) throw invalid(source, "missing frontmatter");
                    int end = text.indexOf("\n---", 4);
                    if (end < 0 || (end + 4 < text.length() && text.charAt(end + 4) != '\n')) throw invalid(source, "unclosed frontmatter");
                    LoaderOptions options = new LoaderOptions();
                    options.setAllowDuplicateKeys(false);
                    Object parsed = new Yaml(new SafeConstructor(options)).load(text.substring(4, end));
                    if (!(parsed instanceof Map<?, ?> data)) throw invalid(source, "frontmatter must be a mapping");
                    String status = required(data, "status", 20, source);
                    if (status.equals("draft")) continue;
                    if (!status.equals("published")) throw invalid(source, "unknown status");
                    Object rawTags = data.get("tags");
                    if (!(rawTags instanceof List<?> tags) || tags.size() > 30 || tags.stream().anyMatch(t -> !(t instanceof String s) || s.isBlank() || s.length() > 80))
                        throw invalid(source, "tags must be a string list (max 30)");
                    Object rawDate = data.get("date");
                    LocalDate date;
                    try { date = rawDate instanceof Date d ? d.toInstant().atZone(ZoneOffset.UTC).toLocalDate() : LocalDate.parse(String.valueOf(rawDate)); }
                    catch (RuntimeException e) { throw invalid(source, "date must be YYYY-MM-DD"); }
                    Integer week = null;
                    if (data.containsKey("week")) {
                        if (!(data.get("week") instanceof Integer n) || n < 1 || n > 104) throw invalid(source, "invalid week");
                        week = (Integer) data.get("week");
                    }
                    String metadata = text.substring(4, end);
                    result.add(new PostMetadata(slug, required(data,"title",240,source), required(data,"description",4000,source),
                        required(data,"category",100,source), tags.stream().map(String.class::cast).distinct().toList(), date,
                        optional(data,"series",source), optional(data,"project",source), week, collection, hash(collection + "\n" + metadata)));
                }
            }
        }
        return List.copyOf(result);
    }
    private static String required(Map<?, ?> data, String key, int max, Path source) {
        if (!(data.get(key) instanceof String value) || value.isBlank() || value.length() > max) throw invalid(source, "invalid " + key);
        return (String) data.get(key);
    }
    private static String optional(Map<?, ?> data, String key, Path source) {
        return data.containsKey(key) ? required(data,key,160,source) : null;
    }
    private static IllegalArgumentException invalid(Path source, String reason) { return new IllegalArgumentException(source + ": " + reason); }
    public static String hash(String text) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
}
