import assert from "node:assert/strict";
import {
  createGame,
  getActivePieceSummary,
  input,
  renderGameToText,
  step
} from "../src/game-core.js";

const gameA = createGame(20260309);
const gameB = createGame(20260309);
assert.equal(renderGameToText(gameA), renderGameToText(gameB), "same seed should produce deterministic state");

const firstMode = getActivePieceSummary(gameA).mode;
step(gameA, 10_000);
const secondMode = getActivePieceSummary(gameA).mode;
assert.notEqual(firstMode, secondMode, "piece mode should alternate between tetromino and capsule after lock");

const pieceBeforePause = getActivePieceSummary(gameA);
const elapsedBeforePause = gameA.elapsedMs;
input(gameA, "togglePause");
step(gameA, 2_000);
const pieceAfterPause = getActivePieceSummary(gameA);
assert.deepEqual(pieceAfterPause, pieceBeforePause, "paused state should freeze piece movement");
assert.equal(gameA.elapsedMs, elapsedBeforePause, "paused state should freeze elapsed simulation time");
input(gameA, "togglePause");

const beforeReset = renderGameToText(gameA);
input(gameA, "moveLeft");
step(gameA, 150);
assert.notEqual(renderGameToText(gameA), beforeReset, "state should change while playing");
input(gameA, "reset");
assert.equal(renderGameToText(gameA), renderGameToText(createGame(20260309)), "reset should restore deterministic initial state");

console.log("game-core tests passed");
