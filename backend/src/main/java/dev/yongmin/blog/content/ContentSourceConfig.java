package dev.yongmin.blog.content;

import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class ContentSourceConfig {
    @Bean
    @ConditionalOnProperty(name = "blog.content.source", havingValue = "local", matchIfMissing = true)
    ContentSource localContentSource(@Value("${blog.content-root}") String root) {
        return new LocalContentSource(Path.of(root));
    }

    @Bean
    @ConditionalOnProperty(name = "blog.content.source", havingValue = "github")
    ContentSource githubContentSource(
            @Value("${blog.content.github.repo}") String repo,
            @Value("${blog.content.github.branch:main}") String branch,
            @Value("${blog.content.github.path:frontend/content}") String path,
            @Value("${blog.content.github.token:}") String token) {
        return new GitHubContentSource(repo, branch, path, token);
    }
}
