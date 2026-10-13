package com.careermetric.ai.coach;

import com.careermetric.ai.coach.dto.CareerCoachRequest;
import com.careermetric.ai.coach.dto.CareerCoachResponse;
import com.careermetric.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/ai/career-coach")
@SecurityRequirement(name = "bearerAuth")
public class CareerCoachController {

    private final CareerCoachService careerCoachService;

    public CareerCoachController(
            CareerCoachService careerCoachService) {

        this.careerCoachService = careerCoachService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CareerCoachResponse>> ask(
            @Valid @RequestBody CareerCoachRequest request) {

        CareerCoachResponse response =
                careerCoachService.ask(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Career coach response generated successfully",
                        response,
                        LocalDateTime.now()
                )
        );
    }

    @PostMapping(
            value = "/stream",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public Flux<String> stream(
            @Valid @RequestBody CareerCoachRequest request) {

        return careerCoachService.stream(request);
    }
}