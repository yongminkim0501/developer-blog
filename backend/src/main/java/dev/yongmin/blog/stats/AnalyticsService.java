package dev.yongmin.blog.stats;

import dev.yongmin.blog.api.ApiException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalyticsService {
    private final JdbcTemplate jdbc;
    public AnalyticsService(JdbcTemplate jdbc) { this.jdbc=jdbc; }
    @Transactional(readOnly=true)
    public Analytics summary(LocalDate from, LocalDate to) {
        if(to.isBefore(from) || ChronoUnit.DAYS.between(from,to)>365)
            throw new ApiException(HttpStatus.BAD_REQUEST,"INVALID_REQUEST","통계 기간은 시작일부터 최대 366일입니다.");
        Long totalPosts=jdbc.queryForObject("SELECT COUNT(*) FROM post_index WHERE published=true",Long.class);
        var counts=jdbc.query("""
            SELECT v.viewed_on,SUM(v.views) AS views FROM post_daily_views v
            JOIN post_index p ON p.slug=v.slug AND p.published=true
            WHERE v.viewed_on BETWEEN ? AND ? GROUP BY v.viewed_on ORDER BY v.viewed_on
            """,(rs,n)->new DailyViews(rs.getObject("viewed_on",LocalDate.class),rs.getLong("views")),from,to);
        Map<LocalDate,Long> byDate=new HashMap<>(); counts.forEach(d->byDate.put(d.date(),d.views()));
        var daily=from.datesUntil(to.plusDays(1)).map(d->new DailyViews(d,byDate.getOrDefault(d,0L))).toList();
        var popular=jdbc.query("""
            SELECT p.slug,p.title,SUM(v.views) AS views FROM post_daily_views v
            JOIN post_index p ON p.slug=v.slug AND p.published=true
            WHERE v.viewed_on BETWEEN ? AND ? GROUP BY p.slug,p.title
            ORDER BY views DESC,p.slug ASC LIMIT 10
            """,(rs,n)->new PopularPost(rs.getString("slug"),rs.getString("title"),rs.getLong("views")),from,to);
        return new Analytics(from,to,totalPosts==null?0:totalPosts,daily.stream().mapToLong(DailyViews::views).sum(),daily,popular);
    }
    public record Analytics(LocalDate from,LocalDate to,long publishedPosts,long views,List<DailyViews> daily,List<PopularPost> popularPosts) {}
    public record DailyViews(LocalDate date,long views) {}
    public record PopularPost(String slug,String title,long views) {}
}
