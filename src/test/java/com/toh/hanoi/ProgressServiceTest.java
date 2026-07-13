package com.toh.hanoi;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.toh.hanoi.model.GameStats;
import com.toh.hanoi.service.ProgressService;

@SpringBootTest
class ProgressServiceTest {

    @Autowired
    private ProgressService progressService;

    @Test
    void newUserStartsAtLevelOne() {
        GameStats stats = progressService.getProgress("new-user");

        assertEquals(1, stats.getHighestLevelReached());
        assertTrue(stats.getLevels().get(0).isUnlocked());
        assertFalse(stats.getLevels().get(1).isUnlocked());
    }

    @Test
    void differentUsersDoNotShareProgress() {
        GameStats firstUserStats = progressService.getProgress("user-a");
        firstUserStats.setHighestLevelReached(3);
        firstUserStats.getLevels().get(1).setUnlocked(true);
        progressService.saveProgress("user-a", firstUserStats);

        GameStats secondUserStats = progressService.getProgress("user-b");

        assertEquals(1, secondUserStats.getHighestLevelReached());
        assertFalse(secondUserStats.getLevels().get(1).isUnlocked());
    }
}
