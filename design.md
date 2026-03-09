# Design: Tetris + Dr. Mario Mix-Match Modes

## Core Idea
A single-board puzzle game alternates drop types every turn:
- **Tetromino turn:** place one classic tetromino.
- **Capsule turn:** place a 2-cell colored capsule.

Viruses spawn in lower rows at start. Players clear lines (Tetris rule) and color groups of 4+ connected cells (Dr. Mario rule). Win by clearing all viruses.

## Determinism
- All randomness (virus placement, colors, next pieces) comes from seeded RNG.
- Fixed-step simulation (`step(state, ms)`) controls gravity and timing.
- Browser hooks expose deterministic stepping and textual state.

## Controls
- Arrow keys: move/down
- `Z`: rotate
- `Space`: hard drop
- `P`: pause/resume
- `R`: reset to initial seed state
- `Enter`: restart after game over or win

## Scoring
- Line clears: +100 per line
- Color clear cells: +25 each
- Virus removed bonus: +100 each
