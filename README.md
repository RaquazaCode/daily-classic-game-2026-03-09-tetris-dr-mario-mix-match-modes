# daily-classic-game-2026-03-09-tetris-dr-mario-mix-match-modes

<div align="center">
  <p>Deterministic Tetris + Dr. Mario hybrid where every turn alternates between tetrominoes and color capsules.</p>
</div>

<div align="center">
  <p><strong>Media</strong>: Playwright screenshots, action payload, render text, and GIF clip files are in <code>artifacts/playwright/</code>.</p>
</div>

## Quick Start
1. `pnpm install`
2. `pnpm test`
3. `pnpm build`
4. `pnpm dev` then open `http://127.0.0.1:4173/index.html`

## How To Play
- Use Arrow keys to move falling pieces.
- Press `Z` to rotate and `Space` for hard drop.
- Press `P` to pause/resume.
- Press `R` to reset to deterministic starting state.
- Press `Enter` to restart from win/lose screens.

## Rules
- The board is 10x18 with viruses seeded near the bottom.
- Turns alternate between tetromino pieces and 2-cell capsules.
- A full row clears immediately.
- Any horizontal or vertical group of 4+ same-color cells clears.
- Clear all viruses to win. If a new piece cannot spawn, game over.

## Scoring
- Single line clear: +100 (stacking for multiple lines)
- Cleared colored cell: +25
- Virus removed bonus: +100 each

## Twist
Mix-match modes: each spawn alternates game mode (tetromino then capsule), forcing you to balance geometry and color matching in one board.

## Verification
- Core deterministic tests: `pnpm test`
- Static build copy: `pnpm build`
- Browser capture artifacts: `pnpm capture`

## Project Layout
- `src/` game rules, simulation loop, rendering, browser hooks
- `tests/` deterministic core tests and Playwright capture
- `scripts/` build copier for dist output
- `assets/` static assets
- `docs/plans/` implementation planning
- `artifacts/playwright/` screenshots, action payload, render output, GIF clips

## GIF Captures
- Clip 1 - Opening Alternation: `artifacts/playwright/clip-opening-alternation.gif`
- Clip 2 - Line Clear Setup: `artifacts/playwright/clip-line-clear.gif`
- Clip 3 - Virus Cleanup Push: `artifacts/playwright/clip-virus-cleanup.gif`
