package com.toh.hanoi.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.toh.hanoi.model.GameStats;
import com.toh.hanoi.model.LevelStats;
import com.toh.hanoi.model.UserProgress;
import com.toh.hanoi.repository.UserProgressRepository;

@Service
public class ProgressService {
    private final UserProgressRepository userProgressRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ProgressService(UserProgressRepository userProgressRepository) {
        this.userProgressRepository = userProgressRepository;
    }

    public GameStats getProgress(String username) {
        UserProgress progress = getOrCreateProgress(username);
        return toGameStats(progress);
    }

    public GameStats saveProgress(String username, GameStats stats) {
        UserProgress progress = getOrCreateProgress(username);
        progress.setGamesPlayed(stats.getGamesPlayed());
        progress.setGamesCompleted(stats.getGamesCompleted());
        progress.setTotalMoves(stats.getTotalMoves());
        progress.setTotalTimePlayed(stats.getTotalTimePlayed());
        progress.setHighestLevelReached(stats.getHighestLevelReached());
        progress.setCurrentLevel(Math.max(1, stats.getHighestLevelReached()));
        try {
            progress.setLevelsJson(objectMapper.writeValueAsString(stats.getLevels()));
        } catch (Exception e) {
            throw new RuntimeException("Could not serialize progress", e);
        }
        userProgressRepository.save(progress);
        return stats;
    }

    private UserProgress getOrCreateProgress(String username) {
        Optional<UserProgress> existing = userProgressRepository.findByUsername(username.toLowerCase());
        if (existing.isPresent()) {
            return existing.get();
        }

        UserProgress progress = new UserProgress(username.toLowerCase());
        progress.setCurrentLevel(1);
        progress.setHighestLevelReached(1);
        progress.setGamesPlayed(0);
        progress.setGamesCompleted(0);
        progress.setTotalMoves(0);
        progress.setTotalTimePlayed(0);
        progress.setLevelsJson(toJson(defaultLevels()));
        return userProgressRepository.save(progress);
    }

    private GameStats toGameStats(UserProgress progress) {
        GameStats stats = new GameStats();
        stats.setGamesPlayed(progress.getGamesPlayed());
        stats.setGamesCompleted(progress.getGamesCompleted());
        stats.setTotalMoves(progress.getTotalMoves());
        stats.setTotalTimePlayed(progress.getTotalTimePlayed());
        stats.setHighestLevelReached(progress.getHighestLevelReached());

        try {
            if (progress.getLevelsJson() != null && !progress.getLevelsJson().isBlank()) {
                List<LevelStats> levels = objectMapper.readValue(progress.getLevelsJson(), new TypeReference<>() {});
                stats.setLevels(levels);
            }
        } catch (Exception e) {
            stats.setLevels(defaultLevels());
        }

        if (stats.getLevels() == null || stats.getLevels().isEmpty()) {
            stats.setLevels(defaultLevels());
        }

        return stats;
    }

    private List<LevelStats> defaultLevels() {
        List<LevelStats> levels = new ArrayList<>();
        levels.add(new LevelStats(1, 3, 7, true));
        levels.add(new LevelStats(2, 4, 15, false));
        levels.add(new LevelStats(3, 5, 31, false));
        levels.add(new LevelStats(4, 6, 63, false));
        levels.add(new LevelStats(5, 7, 127, false));
        levels.add(new LevelStats(6, 8, 255, false));
        levels.add(new LevelStats(7, 9, 511, false));
        levels.add(new LevelStats(8, 10, 1023, false));
        return levels;
    }

    private String toJson(List<LevelStats> levels) {
        try {
            return objectMapper.writeValueAsString(levels);
        } catch (Exception e) {
            return "[]";
        }
    }
}
