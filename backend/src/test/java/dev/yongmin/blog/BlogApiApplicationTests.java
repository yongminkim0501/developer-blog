package dev.yongmin.blog;

import dev.yongmin.blog.content.IndexService;
import dev.yongmin.blog.content.PostIndexRepository;
import dev.yongmin.blog.stats.ViewService;
import java.nio.file.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"blog.index.enabled=false","blog.admin-token=integration-test-admin-token-32-characters"})
@AutoConfigureMockMvc
@Testcontainers
class BlogApiApplicationTests {
    @Container static final PostgreSQLContainer database=new PostgreSQLContainer("postgres:17-alpine");
    static final Path content;
    static { try { content=Files.createTempDirectory("devlog-integration-"); } catch(Exception e) { throw new ExceptionInInitializerError(e); } }
    @DynamicPropertySource static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url",database::getJdbcUrl);
        registry.add("spring.datasource.username",database::getUsername);
        registry.add("spring.datasource.password",database::getPassword);
        registry.add("blog.content-root",content::toString);
    }
    @Autowired MockMvc mvc;
    @Autowired IndexService index;
    @Autowired ViewService views;
    @Autowired PostIndexRepository posts;
    @Autowired JdbcTemplate jdbc;
    @Autowired MutableClock clock;
    static final String TOKEN="integration-test-admin-token-32-characters";

    @TestConfiguration static class TestClockConfig {
        @Bean @Primary MutableClock testClock() { return new MutableClock(); }
    }
    static class MutableClock extends Clock {
        volatile Instant now=Instant.parse("2026-09-05T12:00:00Z");
        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }
    @BeforeEach void before() throws Exception {
        jdbc.execute("TRUNCATE post_visits,post_daily_views,post_index CASCADE");
        try(var paths=Files.walk(content)) { for(Path p:paths.sorted(Comparator.reverseOrder()).toList()) if(!p.equals(content)) Files.delete(p); }
        Files.createDirectories(content.resolve("blog"));
        Files.createDirectories(content.resolve("jungle"));
        write("blog","pintos","published","Pintos Priority Donation","scheduler, pintos");
        write("jungle","memory","published","메모리 공부","메모리, malloc");
        write("blog","private","draft","Secret note","secret");
        clock.now=Instant.parse("2026-09-05T12:00:00Z");
        index.sync();
    }
    static void write(String collection,String slug,String status,String title,String tags) throws Exception {
        Path directory=content.resolve(collection).resolve(slug); Files.createDirectories(directory);
        Files.writeString(directory.resolve("index.mdx"),"""
            ---
            title: "%s"
            description: "테스트 설명"
            date: "2026-09-05"
            category: "Operating System"
            tags: [%s]
            status: "%s"
            project: "krafton-jungle"
            week: 8
            ---
            ## Not stored in the database
            PRIVATE BODY TEXT
            """.formatted(title,tags,status));
    }
    @Test void searchesPublishedMetadataWithAndSemanticsAndLiteralWildcards() throws Exception {
        mvc.perform(get("/api/v1/search").param("q","PINTOS priority")).andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true)).andExpect(jsonPath("$.data.results.length()").value(1))
            .andExpect(jsonPath("$.data.results[0].slug").value("pintos")).andExpect(jsonPath("$.data.query").value("PINTOS priority"));
        mvc.perform(get("/api/v1/search").param("q","scheduler")).andExpect(jsonPath("$.data.results[0].slug").value("pintos"));
        mvc.perform(get("/api/v1/search").param("q","메모리")).andExpect(jsonPath("$.data.results[0].slug").value("memory"));
        for(String query:List.of("%","_","secret","PRIVATE BODY TEXT")) mvc.perform(get("/api/v1/search").param("q",query)).andExpect(jsonPath("$.data.results").isEmpty());
        mvc.perform(get("/api/v1/search").param("q","")).andExpect(jsonPath("$.data.results.length()").value(2));
        mvc.perform(get("/api/v1/search")).andExpect(status().isBadRequest()).andExpect(jsonPath("$.error.code").value("INVALID_REQUEST"));
        mvc.perform(get("/api/v1/search").param("q","x".repeat(201))).andExpect(status().isBadRequest());
    }
    @Test void reindexIsIdempotentAndReflectsEditsDraftsDeletesAndRepublishing() throws Exception {
        views.record("pintos",UUID.randomUUID());
        assertThat(index.sync().unchanged()).isEqualTo(2);
        write("blog","pintos","published","Changed title","scheduler");
        assertThat(index.sync().updated()).isEqualTo(1);
        assertThat(views.get("pintos").views()).isEqualTo(1);
        write("blog","pintos","draft","Changed title","scheduler");
        Files.delete(content.resolve("jungle/memory/index.mdx"));
        assertThat(index.sync().unpublished()).isEqualTo(2);
        mvc.perform(get("/api/v1/search").param("q","")).andExpect(jsonPath("$.data.results").isEmpty());
        mvc.perform(get("/api/v1/posts/pintos/views")).andExpect(status().isNotFound());
        mvc.perform(post("/api/v1/posts/pintos/views").contentType("application/json").content("{\"visitorId\":\""+UUID.randomUUID()+"\"}")).andExpect(status().isNotFound());
        write("blog","pintos","published","Changed title","scheduler");
        index.sync();
        assertThat(views.get("pintos").views()).isEqualTo(1);
    }
    @Test void malformedSnapshotAndDuplicateSlugsPreserveExistingIndex() throws Exception {
        Files.writeString(content.resolve("blog/pintos/index.mdx"),"invalid mdx");
        assertThatThrownBy(()->index.sync()).isInstanceOf(IllegalArgumentException.class);
        assertThat(posts.existsBySlugAndPublishedTrue("pintos")).isTrue();
        write("blog","pintos","published","Pintos Priority Donation","scheduler");
        write("jungle","pintos","published","Duplicate","scheduler");
        assertThatThrownBy(()->index.sync()).hasMessageContaining("duplicate");
        assertThat(posts.count()).isEqualTo(2);
    }
    @Test void validatesVisitsAndDeduplicatesConcurrentRequestsWithoutLostUpdates() throws Exception {
        UUID sameVisitor=UUID.randomUUID();
        try(ExecutorService executor=Executors.newVirtualThreadPerTaskExecutor()) {
            List<Callable<ViewService.ViewCount>> calls=new ArrayList<>();
            for(int i=0;i<12;i++) calls.add(()->views.record("pintos",sameVisitor));
            for(int i=0;i<12;i++) calls.add(()->views.record("pintos",UUID.randomUUID()));
            for(var future:executor.invokeAll(calls)) future.get(10,TimeUnit.SECONDS);
        }
        assertThat(views.get("pintos").views()).isEqualTo(13);
        mvc.perform(post("/api/v1/posts/pintos/views").contentType("application/json").content("{\"visitorId\":\"invalid\"}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error.code").value("INVALID_REQUEST"));
        mvc.perform(post("/api/v1/posts/pintos/views").contentType("application/json").content("{}"))
            .andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/posts/missing/views")).andExpect(status().isNotFound()).andExpect(jsonPath("$.error.code").value("POST_NOT_FOUND"));
    }
    @Test void countsDailyVisitsAndProtectsAnalyticsAndReindex() throws Exception {
        UUID visitor=UUID.randomUUID();
        views.record("pintos",visitor); views.record("pintos",visitor);
        clock.now=clock.now.plus(Duration.ofDays(1));
        views.record("pintos",visitor);
        assertThat(views.get("pintos").views()).isEqualTo(2);
        mvc.perform(post("/api/v1/admin/reindex")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/admin/analytics")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/admin/reindex").header("X-Admin-Token",TOKEN)).andExpect(status().isOk()).andExpect(jsonPath("$.data.published").value(2));
        mvc.perform(get("/api/v1/admin/analytics").header("X-Admin-Token",TOKEN).param("from","2026-09-04").param("to","2026-09-06"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.views").value(2)).andExpect(jsonPath("$.data.daily.length()").value(3))
            .andExpect(jsonPath("$.data.daily[0].views").value(0)).andExpect(jsonPath("$.data.popularPosts[0].slug").value("pintos"));
        mvc.perform(get("/api/v1/admin/analytics").header("X-Admin-Token",TOKEN).param("from","2027-01-01").param("to","2026-01-01"))
            .andExpect(status().isBadRequest());
        clock.now=clock.now.plus(Duration.ofDays(4)); index.sync();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM post_visits",Long.class)).isZero();
        assertThat(views.get("pintos").views()).isEqualTo(2);
    }
    @AfterAll static void cleanup() throws Exception {
        try(var paths=Files.walk(content)) { for(Path p:paths.sorted(Comparator.reverseOrder()).toList()) Files.delete(p); }
    }
}
