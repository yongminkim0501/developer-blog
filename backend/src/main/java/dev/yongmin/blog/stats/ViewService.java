package dev.yongmin.blog.stats;

import dev.yongmin.blog.api.ApiException;
import dev.yongmin.blog.content.MdxMetadataReader;
import dev.yongmin.blog.content.PostIndexRepository;
import java.time.Clock;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ViewService {
    private final JdbcTemplate jdbc;
    private final PostIndexRepository posts;
    private final Clock clock;
    public ViewService(JdbcTemplate jdbc, PostIndexRepository posts, Clock clock) { this.jdbc=jdbc; this.posts=posts; this.clock=clock; }
    @Transactional(readOnly=true)
    public ViewCount get(String slug) {
        if (!posts.existsBySlugAndPublishedTrue(slug)) throw ApiException.notFound();
        return count(slug);
    }
    @Transactional
    public ViewCount record(String slug, UUID visitorId) {
        // Keep publication status stable while recording the visit.
        var found=jdbc.queryForList("SELECT slug FROM post_index WHERE slug=? AND published=true FOR SHARE",String.class,slug);
        if(found.isEmpty()) throw ApiException.notFound();
        LocalDate today=LocalDate.now(clock);
        String hash=MdxMetadataReader.hash(visitorId.toString());
        int inserted=jdbc.update("""
            INSERT INTO post_visits(slug,visitor_hash,viewed_on) VALUES (?,?,?)
            ON CONFLICT DO NOTHING
            """,slug,hash,today);
        if(inserted==1) jdbc.update("""
            INSERT INTO post_daily_views(slug,viewed_on,views) VALUES (?,?,1)
            ON CONFLICT(slug,viewed_on) DO UPDATE SET views=post_daily_views.views+1
            """,slug,today);
        return count(slug);
    }
    private ViewCount count(String slug) {
        Long views=jdbc.queryForObject("SELECT COALESCE(SUM(views),0) FROM post_daily_views WHERE slug=?",Long.class,slug);
        return new ViewCount(slug,views==null?0:views);
    }
    public record ViewCount(String slug,long views) {}
}
