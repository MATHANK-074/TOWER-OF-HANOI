package com.toh.hanoi.model;

import java.util.List;

public class HintRequest {
    private List<Integer> disks;
    private int target;

    public HintRequest() {}

    public HintRequest(List<Integer> disks, int target) {
        this.disks = disks;
        this.target = target;
    }

    public List<Integer> getDisks() {
        return disks;
    }

    public void setDisks(List<Integer> disks) {
        this.disks = disks;
    }

    public int getTarget() {
        return target;
    }

    public void setTarget(int target) {
        this.target = target;
    }
}
