package com.toh.hanoi.model;

import java.util.ArrayList;
import java.util.List;

public class GameStats {
    private int gamesPlayed;
    private int gamesCompleted;
    private int totalMoves;
    private long totalTimePlayed; // in seconds
    private int highestLevelReached;
    private List<LevelStats> levels;

    public GameStats() {
        this.gamesPlayed = 0;
        this.gamesCompleted = 0;
        this.totalMoves = 0;
        this.totalTimePlayed = 0;
        this.highestLevelReached = 1;
        this.levels = new ArrayList<>();
        
        // Pre-initialize Level 1 to 8
        this.levels.add(new LevelStats(1, 3, 7, true));     // Level 1: 3 Disks (Easy) - Unlocked
        this.levels.add(new LevelStats(2, 4, 15, false));   // Level 2: 4 Disks
        this.levels.add(new LevelStats(3, 5, 31, false));   // Level 3: 5 Disks
        this.levels.add(new LevelStats(4, 6, 63, false));   // Level 4: 6 Disks
        this.levels.add(new LevelStats(5, 7, 127, false));  // Level 5: 7 Disks
        this.levels.add(new LevelStats(6, 8, 255, false));  // Level 6: 8 Disks
        this.levels.add(new LevelStats(7, 9, 511, false));  // Level 7: 9 Disks
        this.levels.add(new LevelStats(8, 10, 1023, false));// Level 8: 10 Disks (Master)
    }

    public int getGamesPlayed() {
        return gamesPlayed;
    }

    public void setGamesPlayed(int gamesPlayed) {
        this.gamesPlayed = gamesPlayed;
    }

    public int getGamesCompleted() {
        return gamesCompleted;
    }

    public void setGamesCompleted(int gamesCompleted) {
        this.gamesCompleted = gamesCompleted;
    }

    public int getTotalMoves() {
        return totalMoves;
    }

    public void setTotalMoves(int totalMoves) {
        this.totalMoves = totalMoves;
    }

    public long getTotalTimePlayed() {
        return totalTimePlayed;
    }

    public void setTotalTimePlayed(long totalTimePlayed) {
        this.totalTimePlayed = totalTimePlayed;
    }

    public int getHighestLevelReached() {
        return highestLevelReached;
    }

    public void setHighestLevelReached(int highestLevelReached) {
        this.highestLevelReached = highestLevelReached;
    }

    public List<LevelStats> getLevels() {
        return levels;
    }

    public void setLevels(List<LevelStats> levels) {
        this.levels = levels;
    }
}
