package com.careermetric.security.service;

import com.careermetric.auth.entity.User;

public interface CurrentUserService {

    Long getCurrentUserId();

    User getCurrentUser();
}