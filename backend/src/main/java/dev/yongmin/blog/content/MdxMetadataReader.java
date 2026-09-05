package dev.yongmin.blog.content;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.LoaderOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.SafeConstructor;

@Component
public class MdxMetadataReader {
    private final ContentSource source;
    public MdxMetadataReader(ContentSource source) { this.source = source; }

    // Build a complete valid snapshot before touching the database. A broken source or
    // malformed document must not silently remove the existing index.
    public List<PostMetadata> readPublished() throws IOException {
        List<ContentSource.ContentFile> files = new ArrayList<>(source.listIndexFiles());
        files.sort(Comparator.comparing(ContentSource.ContentFile::collection)
            .thenComparing(ContentSource.ContentFile::slug));
        List<PostMetadata> result = new ArrayList<>();
        Set<String> slugs = new HashSet<>();
        for (ContentSource.ContentFile file : files) {
            String collection = file.collection();
            String slug = file.slug();
            String label = collection + "/" + slug + "/index.mdx";
            if (!slug.matches("[a-z0-9][a-z0-9-]{0,159}")) throw invalid(label, "invalid slug");
            if (!slugs.add(slug)) throw invalid(label, "duplicate blog/jungle slug");
            String text = file.text().replace("\r\n", "\n");
            if (text.startsWith("\ufeff")) text = text.substring(1);
            if (!text.startsWith("---\n")) throw invalid(label, "missing frontmatter");
            int end = text.indexOf("\n---", 4);
            if (end < 0 || (end + 4 < text.length() && text.charAt(end + 4) != '\n')) throw invalid(label, "unclosed frontmatter");
            LoaderOptions options = new LoaderOptions();
            options.setAllowDuplicateKeys(false);
            Object parsed = new Yaml(new SafeConstructor(options)).load(text.substring(4, end));
            if (!(parsed instanceof Map<?, ?> data)) throw invalid(label, "frontmatter must be a mapping");
            String status = required(data, "status", 20, label);
            if (status.equals("draft")) continue;
            if (!status.equals("published")) throw invalid(label, "unknown status");
            Object rawTags = data.get("tags");
            if (!(rawTags instanceof List<?> tags) || tags.size() > 30 || tags.stream().anyMatch(t -> !(t instanceof String s) || s.isBlank() || s.length() > 80))
                throw invalid(label, "tags must be a string list (max 30)");
            Object rawDate = data.get("date");
            LocalDate date;
            try { date = rawDate instanceof Date d ? d.toInstant().atZone(ZoneOffset.UTC).toLocalDate() : LocalDate.parse(String.valueOf(rawDate)); }
            catch (RuntimeException e) { throw invalid(label, "date must be YYYY-MM-DD"); }
            Integer week = null;
            if (data.containsKey("week")) {
                if (!(data.get("week") instanceof Integer n) || n < 1 || n > 104) throw invalid(label, "invalid week");
                week = (Integer) data.get("week");
            }
            String metadata = text.substring(4, end);
            result.add(new PostMetadata(slug, required(data,"title",240,label), required(data,"description",4000,label),
                required(data,"category",100,label), tags.stream().map(String.class::cast).distinct().toList(), date,
                optional(data,"series",label), optional(data,"project",label), week, collection, hash(collection + "\n" + metadata)));
        }
        return List.copyOf(result);
    }
    private static String required(Map<?, ?> data, String key, int max, String label) {
        if (!(data.get(key) instanceof String value) || value.isBlank() || value.length() > max) throw invalid(label, "invalid " + key);
        return (String) data.get(key);
    }
    private static String optional(Map<?, ?> data, String key, String label) {
        return data.containsKey(key) ? required(data,key,160,label) : null;
    }
    private static IllegalArgumentException invalid(String label, String reason) { return new IllegalArgumentException(label + ": " + reason); }
    public static String hash(String text) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
}
