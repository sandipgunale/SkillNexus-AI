package com.careermetric.ai.coach;

import com.careermetric.ai.coach.dto.CareerCoachRequest;
import com.careermetric.ai.coach.dto.CareerCoachResponse;
import reactor.core.publisher.Flux;

public interface CareerCoachService {

    CareerCoachResponse ask(CareerCoachRequest request);

    Flux<String> stream(CareerCoachRequest request);
}