import { useState } from 'react';
import { ArrowLeft, BookOpen, Calculator, GitCommit, Play, ArrowRight } from 'lucide-react';
import { audioManager } from '../utils/audio';

export default function AlgorithmPanel({ onViewChange }) {
  const [activeTreeNode, setActiveTreeNode] = useState(null);

  const handleBack = () => {
    audioManager.playClick();
    onViewChange('home');
  };

  const handleNodeHover = (nodeId) => {
    setActiveTreeNode(nodeId);
  };

  const codeString = `void solveHanoi(int n, char from, char to, char aux) {
    if (n == 1) {
        System.out.println("Move disk 1 from " + from + " to " + to);
        return;
    }
    // 1. Move top n-1 disks from Source to Helper
    solveHanoi(n - 1, from, aux, to);
    
    // 2. Move largest disk from Source to Target
    System.out.println("Move disk " + n + " from " + from + " to " + to);
    
    // 3. Move n-1 disks from Helper to Target
    solveHanoi(n - 1, aux, to, from);
}`;

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-8 z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold glassmorphism hover:bg-white/10 transition duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <h2 className="text-3xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] neon-text-glow flex items-center gap-2">
          <Calculator className="w-8 h-8 text-[var(--color-primary)]" />
          ALGORITHM & MATH
        </h2>
        <div className="w-28" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-start">
        {/* Math & Complexity Details (Left 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Complexity Card */}
          <div className="glassmorphism rounded-2xl p-6 border border-white/5">
            <h3 className="text-lg font-bold font-display text-white mb-4 border-b border-white/5 pb-2">
              Complexity Analysis
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <h4 className="font-semibold text-white text-sm">Time Complexity</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Exponential growth rate</p>
                </div>
                <span className="text-xl font-bold font-display text-[var(--color-primary)]">O(2ⁿ)</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <h4 className="font-semibold text-white text-sm">Space Complexity</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Call stack recursion depth</p>
                </div>
                <span className="text-xl font-bold font-display text-[var(--color-accent)]">O(n)</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <h4 className="font-semibold text-white text-sm">Minimum Moves Formula</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Doubles with every disk added</p>
                </div>
                <span className="text-xl font-bold font-display text-[var(--color-secondary)]">2ⁿ − 1</span>
              </div>
            </div>
          </div>

          {/* Mathematical explanation */}
          <div className="glassmorphism rounded-2xl p-6 border border-white/5 text-sm text-[var(--text-muted)] leading-relaxed space-y-3">
            <h3 className="text-lg font-bold font-display text-white">Why O(2ⁿ)?</h3>
            <p>
              To move a stack of size <i>n</i>, we must move the top <i>n-1</i> disks to a helper tower, move the largest disk once, and then move the <i>n-1</i> disks from helper to destination.
            </p>
            <p className="font-mono text-xs bg-black/35 p-3 rounded-lg border border-white/5 text-white">
              T(n) = 2 · T(n - 1) + 1<br />
              T(1) = 1
            </p>
            <p>
              Solving this recurrence relation yields the exact formula <strong>T(n) = 2ⁿ − 1</strong>. This exponential growth means that a 10-disk puzzle takes 1,023 moves, while a 30-disk puzzle would require over 1 billion moves!
            </p>
          </div>
        </div>

        {/* Code Explanation (Right 7 Cols) */}
        <div className="lg:col-span-7 glassmorphism rounded-2xl p-6 border border-white/5">
          <h3 className="text-lg font-bold font-display text-white mb-4">
            Recursive Implementation (Java)
          </h3>
          <pre className="text-xs md:text-sm font-mono bg-black/40 p-4 rounded-xl border border-white/5 text-cyan-300 overflow-x-auto leading-relaxed">
            {codeString}
          </pre>
        </div>
      </div>

      {/* Recursive Call Tree Section */}
      <div className="glassmorphism rounded-2xl p-6 border border-white/5 mb-8">
        <h3 className="text-xl font-bold font-display text-white mb-2 flex items-center gap-2">
          <GitCommit className="w-5 h-5 text-[var(--color-primary)]" />
          Recursive Call Tree (n = 3)
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-8">
          Hover over nodes to visualize how the main task divides into subproblems. Every node represents a method execution. Leaves are the base case solutions.
        </p>

        {/* Interactive Call Tree Visual */}
        <div className="flex flex-col items-center p-4 bg-black/10 border border-white/5 rounded-xl overflow-x-auto min-w-[700px]">
          {/* Level 3: Root */}
          <div className="mb-8 flex flex-col items-center">
            <div
              onMouseEnter={() => handleNodeHover('root')}
              onMouseLeave={() => handleNodeHover(null)}
              className={`px-4 py-2.5 rounded-lg border text-center transition-all duration-300 ${
                activeTreeNode === 'root'
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-105 text-white'
                  : 'border-white/10 bg-white/5 text-[var(--text-muted)]'
              }`}
            >
              <span className="font-bold block text-xs">hanoi(3, A, C, B)</span>
              <span className="text-[10px] opacity-80 block mt-0.5">Main Goal (Moves disk 3 A → C)</span>
            </div>
            {/* Draw lines to child elements */}
            <div className="w-32 h-6 border-b border-white/10 flex justify-between" />
          </div>

          {/* Level 2: Sub-problems */}
          <div className="flex justify-around w-full mb-8">
            {/* Left Branch */}
            <div className="flex flex-col items-center w-1/2">
              <div
                onMouseEnter={() => handleNodeHover('l2-1')}
                onMouseLeave={() => handleNodeHover(null)}
                className={`px-4 py-2 rounded-lg border text-center transition-all duration-300 ${
                  activeTreeNode === 'l2-1' || activeTreeNode === 'root'
                    ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-white'
                    : 'border-white/10 bg-white/5 text-[var(--text-muted)]'
                }`}
              >
                <span className="font-bold block text-xs">hanoi(2, A, B, C)</span>
                <span className="text-[10px] block mt-0.5">Move top 2 disks (1, 2) A → B</span>
              </div>
              <div className="w-24 h-6 border-b border-white/10" />
            </div>

            {/* Right Branch */}
            <div className="flex flex-col items-center w-1/2">
              <div
                onMouseEnter={() => handleNodeHover('l2-2')}
                onMouseLeave={() => handleNodeHover(null)}
                className={`px-4 py-2 rounded-lg border text-center transition-all duration-300 ${
                  activeTreeNode === 'l2-2' || activeTreeNode === 'root'
                    ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-white'
                    : 'border-white/10 bg-white/5 text-[var(--text-muted)]'
                }`}
              >
                <span className="font-bold block text-xs">hanoi(2, B, C, A)</span>
                <span className="text-[10px] block mt-0.5">Move top 2 disks (1, 2) B → C</span>
              </div>
              <div className="w-24 h-6 border-b border-white/10" />
            </div>
          </div>

          {/* Level 1: Leaf Base Cases */}
          <div className="flex justify-between w-full text-[10px]">
            {/* Child 1 */}
            <div className="flex flex-col items-center w-1/4">
              <div
                className={`px-3 py-1.5 rounded border text-center transition-all duration-300 ${
                  activeTreeNode === 'l2-1' || activeTreeNode === 'root'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                    : 'border-white/5 bg-white/5 text-white/40'
                }`}
              >
                <strong className="block">hanoi(1, A, C, B)</strong>
                <span className="block mt-0.5 text-[9px]">Move 1: Disk 1 A → C</span>
              </div>
            </div>

            {/* Middle Step Left */}
            <div className="flex flex-col items-center w-1/4">
              <div
                className={`px-3 py-1.5 rounded border text-center transition-all duration-300 ${
                  activeTreeNode === 'l2-1' || activeTreeNode === 'root'
                    ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300'
                    : 'border-white/5 bg-white/5 text-white/40'
                }`}
              >
                <strong className="block">Base Step</strong>
                <span className="block mt-0.5 text-[9px]">Move 2: Disk 2 A → B</span>
              </div>
            </div>

            {/* Child 2 */}
            <div className="flex flex-col items-center w-1/4">
              <div
                className={`px-3 py-1.5 rounded border text-center transition-all duration-300 ${
                  activeTreeNode === 'l2-1' || activeTreeNode === 'root'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                    : 'border-white/5 bg-white/5 text-white/40'
                }`}
              >
                <strong className="block">hanoi(1, C, B, A)</strong>
                <span className="block mt-0.5 text-[9px]">Move 3: Disk 1 C → B</span>
              </div>
            </div>

            {/* Center Step Root */}
            <div className="flex flex-col items-center w-1/4">
              <div
                className={`px-3 py-1.5 rounded border text-center transition-all duration-300 ${
                  activeTreeNode === 'root'
                    ? 'border-red-500/50 bg-red-500/10 text-red-300'
                    : 'border-white/5 bg-white/5 text-white/40'
                }`}
              >
                <strong className="block">Base Step</strong>
                <span className="block mt-0.5 text-[9px]">Move 4: Disk 3 A → C</span>
              </div>
            </div>

            {/* Child 3 */}
            <div className="flex flex-col items-center w-1/4">
              <div
                className={`px-3 py-1.5 rounded border text-center transition-all duration-300 ${
                  activeTreeNode === 'l2-2' || activeTreeNode === 'root'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                    : 'border-white/5 bg-white/5 text-white/40'
                }`}
              >
                <strong className="block">hanoi(1, B, A, C)</strong>
                <span className="block mt-0.5 text-[9px]">Move 5: Disk 1 B → A</span>
              </div>
            </div>

            {/* Middle Step Right */}
            <div className="flex flex-col items-center w-1/4">
              <div
                className={`px-3 py-1.5 rounded border text-center transition-all duration-300 ${
                  activeTreeNode === 'l2-2' || activeTreeNode === 'root'
                    ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300'
                    : 'border-white/5 bg-white/5 text-white/40'
                }`}
              >
                <strong className="block">Base Step</strong>
                <span className="block mt-0.5 text-[9px]">Move 6: Disk 2 B → C</span>
              </div>
            </div>

            {/* Child 4 */}
            <div className="flex flex-col items-center w-1/4">
              <div
                className={`px-3 py-1.5 rounded border text-center transition-all duration-300 ${
                  activeTreeNode === 'l2-2' || activeTreeNode === 'root'
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                    : 'border-white/5 bg-white/5 text-white/40'
                }`}
              >
                <strong className="block">hanoi(1, A, C, B)</strong>
                <span className="block mt-0.5 text-[9px]">Move 7: Disk 1 A → C</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
