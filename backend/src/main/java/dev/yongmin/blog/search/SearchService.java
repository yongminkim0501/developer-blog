package dev.yongmin.blog.search;

import dev.yongmin.blog.content.PostIndex;
import dev.yongmin.blog.content.PostIndexRepository;
import java.util.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SearchService {
    private final PostIndexRepository posts;
    public SearchService(PostIndexRepository posts) { this.posts=posts; }
    @Transactional(readOnly=true)
    public SearchResult search(String query) {
        Specification<PostIndex> spec=(root,q,cb)->cb.isTrue(root.get("published"));
        for (String term : query.strip().toLowerCase(Locale.ROOT).split("\\s+")) {
            if(term.isBlank()) continue;
            String escaped=term.replace("\\","\\\\").replace("%","\\%").replace("_","\\_");
            spec=spec.and((root,q,cb)->cb.like(root.get("searchText"),"%"+escaped+"%",'\\'));
        }
        var page=posts.findAll(spec,PageRequest.of(0,50,Sort.by(Sort.Order.desc("publishedDate"),Sort.Order.asc("slug"))));
        return new SearchResult(query,page.getContent().stream().map(p->new SearchItem(p.slug(),p.title(),p.description(),p.category(),p.tags())).toList());
    }
    public record SearchResult(String query,List<SearchItem> results) {}
    public record SearchItem(String slug,String title,String description,String category,List<String> tags) {}
}
