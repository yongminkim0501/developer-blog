package dev.yongmin.blog.content;

import java.io.IOException;
import java.time.Clock;
import java.time.Instant;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IndexService {
    private final MdxMetadataReader reader;
    private final PostIndexRepository repository;
    private final JdbcTemplate jdbc;
    private final Clock clock;
    public IndexService(MdxMetadataReader reader, PostIndexRepository repository, JdbcTemplate jdbc, Clock clock) {
        this.reader=reader; this.repository=repository; this.jdbc=jdbc; this.clock=clock;
    }
    @Transactional(rollbackFor=Exception.class)
    public IndexResult sync() throws IOException {
        // Cross-process serialization also covers scheduled + manual reindex requests.
        jdbc.execute("SELECT pg_advisory_xact_lock(749320261)");
        List<PostMetadata> snapshot = reader.readPublished();
        Map<String,PostIndex> existing = new HashMap<>();
        repository.findAll().forEach(p -> existing.put(p.slug(), p));
        int updated=0, unchanged=0, unpublished=0;
        Instant now=clock.instant();
        for (PostMetadata metadata : snapshot) {
            PostIndex post=existing.remove(metadata.slug());
            if (post == null) { repository.save(new PostIndex(metadata,now)); updated++; }
            else if (!post.published() || !post.hash().equals(metadata.hash())) { post.update(metadata,now); updated++; }
            else unchanged++;
        }
        for (PostIndex post : existing.values()) if (post.published()) { post.unpublish(now); unpublished++; }
        jdbc.update("DELETE FROM post_visits WHERE viewed_on < ?", java.time.LocalDate.now(clock).minusDays(2));
        return new IndexResult(snapshot.size(),updated,unchanged,unpublished);
    }
    public record IndexResult(int published, int updated, int unchanged, int unpublished) {}
}
