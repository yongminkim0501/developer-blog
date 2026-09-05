package dev.yongmin.blog.content;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "post_index")
public class PostIndex {
    @Id @Column(length=160) private String slug;
    @Column(nullable=false,length=240) private String title;
    @Column(nullable=false,columnDefinition="text") private String description;
    @Column(nullable=false,length=100) private String category;
    @JdbcTypeCode(SqlTypes.JSON) @Column(nullable=false,columnDefinition="jsonb") private List<String> tags;
    @Column(nullable=false) private LocalDate publishedDate;
    @Column(length=160) private String series;
    @Column(length=160) private String project;
    private Integer week;
    @Column(nullable=false,length=16) private String sourceCollection;
    @Column(nullable=false,length=64) private String contentHash;
    @Column(nullable=false,columnDefinition="text") private String searchText;
    @Column(nullable=false) private boolean published;
    @Column(nullable=false) private Instant indexedAt;
    protected PostIndex() {}
    public PostIndex(PostMetadata metadata, Instant now) { this.slug = metadata.slug(); update(metadata, now); }
    public void update(PostMetadata m, Instant now) {
        title=m.title(); description=m.description(); category=m.category(); tags=m.tags(); publishedDate=m.date();
        series=m.series(); project=m.project(); week=m.week(); sourceCollection=m.collection(); contentHash=m.hash();
        searchText=(title+" "+description+" "+category+" "+String.join(" ",tags)).toLowerCase(Locale.ROOT);
        published=true; indexedAt=now;
    }
    public void unpublish(Instant now) { published=false; indexedAt=now; }
    public String slug() { return slug; }
    public String title() { return title; }
    public String description() { return description; }
    public String category() { return category; }
    public List<String> tags() { return tags; }
    public String hash() { return contentHash; }
    public boolean published() { return published; }
}
