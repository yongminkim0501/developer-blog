package dev.yongmin.blog.content;

import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class PublishedContentTests {
    @Test void currentRepositoryContentCanBeIndexedIncludingPostsMissingInProduction() throws Exception {
        var reader = new MdxMetadataReader(new LocalContentSource(Path.of("../frontend/content")));
        assertThat(reader.readPublished()).extracting(PostMetadata::slug)
            .contains("ab180-kafka-event-ordering-review", "kafka-consumer-offset-and-rebalance",
                "spring-ai-streaming-npe");
    }
}
