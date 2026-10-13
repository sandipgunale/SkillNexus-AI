package com.careermetric.ai.config;

import com.zaxxer.hikari.HikariDataSource;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration(proxyBeanMethods = false)
public class PgVectorConfig {

    @Bean(defaultCandidate = false)
    @ConfigurationProperties("pgvector.datasource")
    public HikariDataSource pgVectorDataSource() {
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .build();
    }

    @Bean
    public JdbcTemplate pgVectorJdbcTemplate(
            @Qualifier("pgVectorDataSource")
            HikariDataSource dataSource) {

        return new JdbcTemplate(dataSource);
    }

    @Bean
    public VectorStore vectorStore(
            @Qualifier("pgVectorJdbcTemplate")
            JdbcTemplate jdbcTemplate,

            @Qualifier("googleGenAiTextEmbedding")
            EmbeddingModel embeddingModel) {

        return PgVectorStore.builder(jdbcTemplate, embeddingModel)
                .dimensions(1024)
                .distanceType(PgVectorStore.PgDistanceType.COSINE_DISTANCE)
                .indexType(PgVectorStore.PgIndexType.HNSW)
                .initializeSchema(true)
                .schemaName("public")
                .vectorTableName("vector_store")
                .maxDocumentBatchSize(100)
                .build();
    }
}