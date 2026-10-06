package dev.yongmin.blog.stats;

import dev.yongmin.blog.content.MdxMetadataReader;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SiteStatsService {
    public static final ZoneId ZONE = ZoneId.of("Asia/Seoul");
    private final JdbcTemplate jdbc;
    private final Clock clock;

    public SiteStatsService(JdbcTemplate jdbc, Clock clock) {
        this.jdbc = jdbc;
        this.clock = clock;
    }

    @Transactional
    public Summary record(UUID visitorId) {
        LocalDate today = LocalDate.ofInstant(clock.instant(), ZONE);
        int inserted = jdbc.update("""
            INSERT INTO site_visits(visitor_hash, visited_on) VALUES (?, ?)
            ON CONFLICT DO NOTHING
            """, MdxMetadataReader.hash(visitorId.toString()), today);
        if (inserted == 1) jdbc.update("""
            INSERT INTO site_daily_visitors(visited_on, visitors) VALUES (?, 1)
            ON CONFLICT(visited_on) DO UPDATE SET visitors = site_daily_visitors.visitors + 1
            """, today);
        return summary();
    }

    @Transactional(readOnly = true)
    public Summary summary() {
        LocalDate today = LocalDate.ofInstant(clock.instant(), ZONE);
        long[] visits = jdbc.queryForObject("""
            SELECT COALESCE(SUM(visitors) FILTER (WHERE visited_on = ?), 0) AS today,
                   COALESCE(SUM(visitors), 0) AS total FROM site_daily_visitors
            """, (rs, row) -> new long[] {rs.getLong("today"), rs.getLong("total")}, today);
        Map<String, Long> postViews = new LinkedHashMap<>();
        jdbc.query("""
            SELECT p.slug, COALESCE(SUM(v.views), 0) AS views FROM post_index p
            LEFT JOIN post_daily_views v ON p.slug = v.slug
            WHERE p.published = true GROUP BY p.slug ORDER BY p.slug
            """, rs -> { postViews.put(rs.getString("slug"), rs.getLong("views")); });
        long totalViews = postViews.values().stream().mapToLong(Long::longValue).sum();
        return new Summary(today, "Asia/Seoul", visits[0], visits[1], totalViews, postViews);
    }

    public record Summary(LocalDate date, String timeZone, long todayVisitors,
                          long totalVisitors, long totalViews, Map<String, Long> postViews) {}
}
