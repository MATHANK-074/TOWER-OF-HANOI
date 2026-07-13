package com.toh.hanoi.service;

import com.toh.hanoi.model.UserAccountEntity;
import com.toh.hanoi.repository.UserAccountRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserAccountRepository userAccountRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    public UserAccountEntity register(String username, String email, String password) {
        if (userAccountRepository.existsByUsername(username.toLowerCase())) {
            throw new IllegalArgumentException("Username already exists");
        }
        String hashed = encoder.encode(password);
        return userAccountRepository.save(new UserAccountEntity(username.toLowerCase(), email, hashed));
    }

    public UserAccountEntity login(String username, String password) {
        UserAccountEntity user = userAccountRepository.findByUsername(username.toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));
        if (!encoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }
        return user;
    }
}
