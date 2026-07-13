package com.toh.hanoi.controller;

import com.toh.hanoi.model.*;
import com.toh.hanoi.service.ProgressService;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HanoiController {

    private final ProgressService progressService;

    public HanoiController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @PostMapping("/solve")
    public List<Move> solve(@RequestBody SolveRequest request) {
        int disks = request.getDisks();
        if (disks < 3 || disks > 10) {
            throw new IllegalArgumentException("Disks count must be between 3 and 10");
        }
        return solveHanoi(disks, 0, 2, 1);
    }

    @PostMapping("/hint")
    public Move hint(@RequestBody HintRequest request) {
        List<Integer> disks = request.getDisks();
        int target = request.getTarget();
        if (disks == null || disks.isEmpty()) {
            throw new IllegalArgumentException("Disks state cannot be empty");
        }
        return getNextOptimalMove(disks, target);
    }

    @GetMapping("/stats")
    public GameStats getStats(@RequestHeader(value = "X-User", required = false) String username) {
        String user = username == null || username.isBlank() ? "guest" : username;
        return progressService.getProgress(user);
    }

    @PostMapping("/stats")
    public GameStats saveStats(@RequestBody GameStats stats,
                               @RequestHeader(value = "X-User", required = false) String username) {
        String user = username == null || username.isBlank() ? "guest" : username;
        return progressService.saveProgress(user, stats);
    }

    // Hanoi Solver algorithm
    private List<Move> solveHanoi(int n, int from, int to, int aux) {
        List<Move> moves = new ArrayList<>();
        solveHanoiRecursive(n, from, to, aux, moves);
        return moves;
    }

    private void solveHanoiRecursive(int n, int from, int to, int aux, List<Move> moves) {
        if (n == 1) {
            moves.add(new Move(0, from, to));
            return;
        }
        solveHanoiRecursive(n - 1, from, aux, to, moves);
        moves.add(new Move(n - 1, from, to));
        solveHanoiRecursive(n - 1, aux, to, from, moves);
    }

    // Hint / Shortest Path finder algorithm
    private Move getNextOptimalMove(List<Integer> positions, int target) {
        int n = positions.size();
        
        // Find the largest disk that is not on its required target.
        int currentTarget = target;
        int diskToMove = -1;
        int diskTarget = -1;
        
        for (int i = n - 1; i >= 0; i--) {
            if (positions.get(i) != currentTarget) {
                diskToMove = i;
                diskTarget = currentTarget;
                break;
            }
        }
        
        if (diskToMove == -1) {
            return null; // Already solved or at target
        }
        
        return getSubTarget(positions, diskToMove, diskTarget);
    }

    private Move getSubTarget(List<Integer> positions, int i, int tgt) {
        if (i < 0) return null;
        
        int currentPos = positions.get(i);
        if (currentPos != tgt) {
            // We must move disk i to tgt.
            // But first, all smaller disks (0 to i-1) must be on the helper tower.
            int helper = 3 - currentPos - tgt;
            Move sub = getSubTarget(positions, i - 1, helper);
            if (sub != null) {
                return sub;
            }
            return new Move(i, currentPos, tgt);
        } else {
            // Disk i is already on tgt. We need to move smaller disks to tgt.
            return getSubTarget(positions, i - 1, tgt);
        }
    }
}
