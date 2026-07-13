package com.toh.hanoi;

import com.toh.hanoi.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Test
    void registerAndLoginShouldSucceed() {
        var registered = authService.register("neo", "neo@example.com", "password123");
        assertNotNull(registered);
        assertEquals("neo", registered.getUsername());

        var loggedIn = authService.login("neo", "password123");
        assertNotNull(loggedIn);
        assertEquals("neo@example.com", loggedIn.getEmail());
    }
}
