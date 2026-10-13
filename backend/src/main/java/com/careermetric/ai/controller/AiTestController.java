package com.careermetric.ai.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai-test")
public class AiTestController {

    private final ChatClient chatClient;

    public AiTestController(
            ChatClient chatClient
    ) {
        this.chatClient = chatClient;
    }

    @GetMapping
    public String test(
            @RequestParam(
                    defaultValue = "Say hello to SkillNexus AI in one sentence."
            )
            String message
    ) {

        return chatClient
                .prompt()
                .user(message)
                .call()
                .content();
    }
}