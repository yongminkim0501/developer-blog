package dev.yongmin.blog.content;

import java.io.IOException;
import java.util.List;

/** Where raw index.mdx files come from, independent of how they're parsed. */
public interface ContentSource {
    record ContentFile(String collection, String slug, String text) {}
    List<ContentFile> listIndexFiles() throws IOException;
}
