import { createGame, input, renderGameToText, step } from "./game-core.js";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const cellSize = 32;
const boardOffsetX = 80;
const boardOffsetY = 70;
const state = createGame(20260309);

function colorForCell(cell) {
  if (!cell) {
    return "#1b2339";
  }
  if (cell.color === "red") {
    return cell.kind === "virus" ? "#d03a48" : "#ff5c6f";
  }
  if (cell.color === "blue") {
    return cell.kind === "virus" ? "#2f63b8" : "#4f89ff";
  }
  return cell.kind === "virus" ? "#b8912a" : "#ffd34f";
}

function drawBoard() {
  ctx.fillStyle = "#0f1222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#101a2b";
  ctx.fillRect(boardOffsetX - 4, boardOffsetY - 4, 10 * cellSize + 8, 18 * cellSize + 8);

  for (let y = 0; y < state.board.length; y += 1) {
    for (let x = 0; x < state.board[y].length; x += 1) {
      const cell = state.board[y][x];
      ctx.fillStyle = colorForCell(cell);
      ctx.fillRect(boardOffsetX + x * cellSize, boardOffsetY + y * cellSize, cellSize - 2, cellSize - 2);
    }
  }
}

function getActiveCells() {
  const p = state.activePiece;
  if (!p) {
    return [];
  }
  if (p.mode === "capsule") {
    const local = p.rotation % 2 === 0
      ? [
          { x: 0, y: 0, color: p.colors[0] },
          { x: 1, y: 0, color: p.colors[1] }
        ]
      : [
          { x: 0, y: 0, color: p.colors[0] },
          { x: 0, y: 1, color: p.colors[1] }
        ];
    return local.map((c) => ({ x: p.x + c.x, y: p.y + c.y, color: c.color }));
  }

  const defs = {
    I: [
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1]
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3]
      ]
    ],
    O: [
      [
        [1, 0],
        [2, 0],
        [1, 1],
        [2, 1]
      ]
    ],
    T: [
      [
        [1, 0],
        [0, 1],
        [1, 1],
        [2, 1]
      ],
      [
        [1, 0],
        [1, 1],
        [2, 1],
        [1, 2]
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [1, 2]
      ],
      [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, 2]
      ]
    ],
    L: [
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1]
      ],
      [
        [1, 0],
        [2, 0],
        [1, 1],
        [1, 2]
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [2, 2]
      ],
      [
        [1, 0],
        [1, 1],
        [0, 2],
        [1, 2]
      ]
    ]
  };

  const rotations = defs[p.shape] || defs.O;
  const cells = rotations[p.rotation % rotations.length];
  return cells.map(([x, y]) => ({ x: p.x + x, y: p.y + y, color: p.color }));
}

function drawActivePiece() {
  for (const cell of getActiveCells()) {
    if (cell.y < 0) {
      continue;
    }
    ctx.fillStyle = colorForCell({ kind: "block", color: cell.color });
    ctx.fillRect(boardOffsetX + cell.x * cellSize, boardOffsetY + cell.y * cellSize, cellSize - 2, cellSize - 2);
  }
}

function drawHud() {
  ctx.fillStyle = "#f0f4ff";
  ctx.font = "bold 20px Trebuchet MS";
  ctx.fillText("Tetris + Dr. Mario", 24, 30);
  ctx.font = "16px Trebuchet MS";
  ctx.fillText(`Score: ${state.score}`, 24, 58);
  ctx.fillText(`Viruses: ${state.virusesRemaining}`, 220, 58);
  ctx.fillText(`Turn: ${state.activePiece.mode}`, 420, 58);

  if (state.isPaused) {
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px Trebuchet MS";
    ctx.fillText("PAUSED", 250, 360);
  }

  if (state.mode === "won" || state.mode === "gameover") {
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Trebuchet MS";
    const title = state.mode === "won" ? "YOU CURED THE VIRUSES" : "GAME OVER";
    ctx.fillText(title, 120, 330);
    ctx.font = "20px Trebuchet MS";
    ctx.fillText("Press Enter to restart", 210, 370);
  }
}

function draw() {
  drawBoard();
  drawActivePiece();
  drawHud();
}

const keyMap = {
  ArrowLeft: "moveLeft",
  ArrowRight: "moveRight",
  ArrowDown: "moveDown",
  z: "rotate",
  Z: "rotate",
  " ": "hardDrop",
  p: "togglePause",
  P: "togglePause",
  r: "reset",
  R: "reset",
  Enter: "restart"
};

window.addEventListener("keydown", (event) => {
  const command = keyMap[event.key];
  if (!command) {
    return;
  }
  event.preventDefault();
  input(state, command);
  draw();
});

let lastTs = performance.now();
function frame(ts) {
  const dt = Math.min(120, ts - lastTs);
  lastTs = ts;
  step(state, dt);
  draw();
  requestAnimationFrame(frame);
}

window.advanceTime = (ms) => {
  step(state, ms);
  draw();
};
window.render_game_to_text = () => renderGameToText(state);

requestAnimationFrame(frame);
