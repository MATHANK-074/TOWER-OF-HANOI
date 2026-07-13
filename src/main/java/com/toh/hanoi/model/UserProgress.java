package com.toh.hanoi.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_progress")
public class UserProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private int currentLevel = 1;

    @Column(nullable = false)
    private int gamesPlayed = 0;

    @Column(nullable = false)
    private int gamesCompleted = 0;

    @Column(nullable = false)
    private int totalMoves = 0;

    @Column(nullable = false)
    private long totalTimePlayed = 0;

    @Column(nullable = false)
    private int highestLevelReached = 1;

    @Column(columnDefinition = "TEXT")
    private String levelsJson = "";

    public UserProgress() {}

    public UserProgress(String username) {
        this.username = username;
        this.levelsJson = "[]";
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public int getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(int currentLevel) { this.currentLevel = currentLevel; }
    public int getGamesPlayed() { return gamesPlayed; }
    public void setGamesPlayed(int gamesPlayed) { this.gamesPlayed = gamesPlayed; }
    public int getGamesCompleted() { return gamesCompleted; }
    public void setGamesCompleted(int gamesCompleted) { this.gamesCompleted = gamesCompleted; }
    public int getTotalMoves() { return totalMoves; }
    public void setTotalMoves(int totalMoves) { this.totalMoves = totalMoves; }
    public long getTotalTimePlayed() { return totalTimePlayed; }
    public void setTotalTimePlayed(long totalTimePlayed) { this.totalTimePlayed = totalTimePlayed; }
    public int getHighestLevelReached() { return highestLevelReached; }
    public void setHighestLevelReached(int highestLevelReached) { this.highestLevelReached = highestLevelReached; }
    public String getLevelsJson() { return levelsJson; }
    public void setLevelsJson(String levelsJson) { this.levelsJson = levelsJson; }
}
