package dev.yongmin.blog.content;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Reads index.mdx files straight from a GitHub repository via the REST API, so the backend
 * never depends on the frontend's build artifact or a shared filesystem mount.
 */
class GitHubContentSource implements ContentSource {
    private final RestClient client;
    private final String repo;
    private final String ref;
    private final Pattern indexPath;

    GitHubContentSource(String repo, String branch, String contentPath, String token) {
        this.repo = repo;
        this.ref = branch;
        this.indexPath = Pattern.compile("^" + Pattern.quote(trimSlashes(contentPath)) + "/(blog|jungle)/([^/]+)/index\\.mdx$");
        RestClient.Builder builder = RestClient.builder()
            .baseUrl("https://api.github.com")
            .defaultHeader("Accept", "application/vnd.github+json")
            .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
            .defaultHeader("User-Agent", "dev-log-backend");
        if (token != null && !token.isBlank()) builder.defaultHeader("Authorization", "Bearer " + token);
        this.client = builder.build();
    }

    private static String trimSlashes(String path) {
        String trimmed = path;
        if (trimmed.startsWith("/")) trimmed = trimmed.substring(1);
        if (trimmed.endsWith("/")) trimmed = trimmed.substring(0, trimmed.length() - 1);
        return trimmed;
    }

    @Override
    public List<ContentFile> listIndexFiles() throws IOException {
        Tree tree;
        try {
            tree = client.get()
                .uri(URI.create("https://api.github.com/repos/" + repo + "/git/trees/" + ref + "?recursive=1"))
                .retrieve()
                .body(Tree.class);
        } catch (RestClientException e) {
            throw new IOException("GitHub tree fetch failed for " + repo + "@" + ref + ": " + e.getMessage(), e);
        }
        if (tree == null || tree.tree() == null) throw new IOException("Empty GitHub tree response for " + repo + "@" + ref);
        List<ContentFile> files = new ArrayList<>();
        for (Entry entry : tree.tree()) {
            if (!"blob".equals(entry.type())) continue;
            var matcher = indexPath.matcher(entry.path());
            if (!matcher.matches()) continue;
            files.add(new ContentFile(matcher.group(1), matcher.group(2), fetchBlob(entry.sha())));
        }
        return files;
    }

    private String fetchBlob(String sha) throws IOException {
        Blob blob;
        try {
            blob = client.get()
                .uri(URI.create("https://api.github.com/repos/" + repo + "/git/blobs/" + sha))
                .retrieve()
                .body(Blob.class);
        } catch (RestClientException e) {
            throw new IOException("GitHub blob fetch failed for " + sha + ": " + e.getMessage(), e);
        }
        if (blob == null || blob.content() == null) throw new IOException("Empty GitHub blob response for " + sha);
        return new String(Base64.getMimeDecoder().decode(blob.content()), StandardCharsets.UTF_8);
    }

    private record Tree(List<Entry> tree, boolean truncated) {}
    private record Entry(String path, String type, String sha) {}
    private record Blob(String content, String encoding, String sha) {}
}
