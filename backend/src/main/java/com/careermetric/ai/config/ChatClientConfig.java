package com.careermetric.ai.config;

import com.careermetric.ai.tool.CareerMetricTools;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class ChatClientConfig {

    @Bean
    public ChatMemory chatMemory() {
        return MessageWindowChatMemory.builder()
                .maxMessages(20)
                .build();
    }

    @Bean
    public ChatClient chatClient(
            ChatClient.Builder chatClientBuilder
    ) {

        return chatClientBuilder
                .defaultOptions(
                        OpenAiChatOptions.builder()
                                .extraBody(
                                        Map.of(
                                                "include_reasoning",
                                                false
                                        )
                                )
                )
                .build();
    }
}