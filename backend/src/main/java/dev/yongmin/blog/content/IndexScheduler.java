package dev.yongmin.blog.content;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name="blog.index.enabled", havingValue="true", matchIfMissing=true)
public class IndexScheduler implements ApplicationRunner {
    private static final Logger log=LoggerFactory.getLogger(IndexScheduler.class);
    private final IndexService service;
    public IndexScheduler(IndexService service) { this.service=service; }
    @Override public void run(ApplicationArguments args) throws Exception {
        log.info("Initial content index: {}",service.sync());
    }
    @Scheduled(fixedDelayString="${blog.index.interval-ms:30000}", initialDelayString="${blog.index.interval-ms:30000}")
    public void refresh() {
        try { var result=service.sync(); if(result.updated()>0 || result.unpublished()>0) log.info("Content index refreshed: {}",result); }
        catch(Exception e) { log.error("Content index refresh failed; previous index retained",e); }
    }
}
