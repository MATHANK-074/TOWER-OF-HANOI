package com.toh.hanoi.model;

public class Move {
    private int disk;
    private int fromTower;
    private int toTower;

    public Move() {}

    public Move(int disk, int fromTower, int toTower) {
        this.disk = disk;
        this.fromTower = fromTower;
        this.toTower = toTower;
    }

    public int getDisk() {
        return disk;
    }

    public void setDisk(int disk) {
        this.disk = disk;
    }

    public int getFromTower() {
        return fromTower;
    }

    public void setFromTower(int fromTower) {
        this.fromTower = fromTower;
    }

    public int getToTower() {
        return toTower;
    }

    public void setToTower(int toTower) {
        this.toTower = toTower;
    }
}
