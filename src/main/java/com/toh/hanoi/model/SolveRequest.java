package com.toh.hanoi.model;

public class SolveRequest {
    private int disks;

    public SolveRequest() {}

    public SolveRequest(int disks) {
        this.disks = disks;
    }

    public int getDisks() {
        return disks;
    }

    public void setDisks(int disks) {
        this.disks = disks;
    }
}
