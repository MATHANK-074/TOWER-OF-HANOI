package com.toh.hanoi.model;

public class LevelStats {
    private int levelIndex;
    private int disks;
    private int minMoves;
    private long bestTime; // in seconds, 0 means not completed yet
    private int bestMoves; // 0 means not completed yet
    private int stars;     // star rating: 0 to 3
    private boolean unlocked;

    public LevelStats() {}

    public LevelStats(int levelIndex, int disks, int minMoves, boolean unlocked) {
        this.levelIndex = levelIndex;
        this.disks = disks;
        this.minMoves = minMoves;
        this.bestTime = 0;
        this.bestMoves = 0;
        this.stars = 0;
        this.unlocked = unlocked;
    }

    public int getLevelIndex() {
        return levelIndex;
    }

    public void setLevelIndex(int levelIndex) {
        this.levelIndex = levelIndex;
    }

    public int getDisks() {
        return disks;
    }

    public void setDisks(int disks) {
        this.disks = disks;
    }

    public int getMinMoves() {
        return minMoves;
    }

    public void setMinMoves(int minMoves) {
        this.minMoves = minMoves;
    }

    public long getBestTime() {
        return bestTime;
    }

    public void setBestTime(long bestTime) {
        this.bestTime = bestTime;
    }

    public int getBestMoves() {
        return bestMoves;
    }

    public void setBestMoves(int bestMoves) {
        this.bestMoves = bestMoves;
    }

    public int getStars() {
        return stars;
    }

    public void setStars(int stars) {
        this.stars = stars;
    }

    public boolean isUnlocked() {
        return unlocked;
    }

    public void setUnlocked(boolean unlocked) {
        this.unlocked = unlocked;
    }
}
