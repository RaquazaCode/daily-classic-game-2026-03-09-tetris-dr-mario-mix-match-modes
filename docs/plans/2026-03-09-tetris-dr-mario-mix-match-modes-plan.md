# Tetris Dr Mario Mix Match Modes Implementation Plan

> **For Implementer:** Optional process aid: use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a deterministic Tetris + Dr. Mario hybrid web game with alternating tetromino/capsule turns and full automation artifacts.

**Architecture:** Use a pure `game-core` module for deterministic rules and state stepping, plus a thin canvas/UI shell in `main.js`. Keep all random choices behind a seeded RNG and expose browser hooks for scripted verification.

**Tech Stack:** Vanilla JavaScript, HTML5 canvas, Node test runner, Playwright, pnpm.

---

### Task 1: Scaffold project and docs

**Files:**
- Create: `README.md`
- Create: `design.md`
- Create: `progress.md`
- Create: `index.html`
- Create: `src/styles.css`
- Create: `package.json`

### Task 2: Write failing deterministic core tests

**Files:**
- Create: `tests/game-core.test.mjs`
- Modify: `src/game-core.js`

### Task 3: Implement deterministic rules and controls

**Files:**
- Modify: `src/game-core.js`
- Create: `src/main.js`

### Task 4: Add build/capture automation

**Files:**
- Create: `scripts/build.mjs`
- Create: `tests/capture.spec.mjs`
- Create: `playwright.config.mjs`
- Create: `vercel.json`

### Task 5: Verify and publish

**Files:**
- Modify: `progress.md`
- Modify: `README.md`
