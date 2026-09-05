package dev.yongmin.blog.content;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PostIndexRepository extends JpaRepository<PostIndex, String>, JpaSpecificationExecutor<PostIndex> {
    boolean existsBySlugAndPublishedTrue(String slug);
}
