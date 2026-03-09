const WIDTH = 10;
const HEIGHT = 18;
const DROP_MS = 500;
const COLORS = ["red", "blue", "yellow"];
const TETROMINOES = {
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

function createRng(seed) {
  let state = (seed >>> 0) || 0x12345678;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

function createBoard() {
  return Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => null));
}

function pickColor(rng) {
  return COLORS[Math.floor(rng() * COLORS.length) % COLORS.length];
}

function spawnViruses(board, rng, count = 14) {
  let attempts = 0;
  let placed = 0;
  while (placed < count && attempts < 2000) {
    attempts += 1;
    const x = Math.floor(rng() * WIDTH);
    const y = 10 + Math.floor(rng() * (HEIGHT - 10));
    if (!board[y][x]) {
      board[y][x] = { kind: "virus", color: pickColor(rng) };
      placed += 1;
    }
  }
}

function clonePiece(piece) {
  return JSON.parse(JSON.stringify(piece));
}

function makePiece(state, turnIndex) {
  const mode = turnIndex % 2 === 0 ? "tetromino" : "capsule";
  if (mode === "tetromino") {
    const keys = Object.keys(TETROMINOES);
    const shape = keys[Math.floor(state.rng() * keys.length) % keys.length];
    return {
      mode,
      shape,
      rotation: 0,
      x: 3,
      y: -1,
      color: pickColor(state.rng)
    };
  }

  return {
    mode,
    shape: "CAPSULE",
    rotation: 0,
    x: 4,
    y: -1,
    colors: [pickColor(state.rng), pickColor(state.rng)]
  };
}

function getLocalCells(piece) {
  if (piece.mode === "capsule") {
    return piece.rotation % 2 === 0
      ? [
          { x: 0, y: 0, color: piece.colors[0] },
          { x: 1, y: 0, color: piece.colors[1] }
        ]
      : [
          { x: 0, y: 0, color: piece.colors[0] },
          { x: 0, y: 1, color: piece.colors[1] }
        ];
  }

  const rotations = TETROMINOES[piece.shape];
  const local = rotations[piece.rotation % rotations.length];
  return local.map(([x, y]) => ({ x, y, color: piece.color }));
}

function getPieceCells(piece) {
  return getLocalCells(piece).map((cell) => ({ x: piece.x + cell.x, y: piece.y + cell.y, color: cell.color }));
}

function collides(state, piece) {
  for (const cell of getPieceCells(piece)) {
    if (cell.x < 0 || cell.x >= WIDTH || cell.y >= HEIGHT) {
      return true;
    }
    if (cell.y >= 0 && state.board[cell.y][cell.x]) {
      return true;
    }
  }
  return false;
}

function tryMove(state, dx, dy) {
  const next = clonePiece(state.activePiece);
  next.x += dx;
  next.y += dy;
  if (collides(state, next)) {
    return false;
  }
  state.activePiece = next;
  return true;
}

function tryRotate(state) {
  const next = clonePiece(state.activePiece);
  next.rotation += 1;
  if (!collides(state, next)) {
    state.activePiece = next;
    return true;
  }
  next.x += 1;
  if (!collides(state, next)) {
    state.activePiece = next;
    return true;
  }
  next.x -= 2;
  if (!collides(state, next)) {
    state.activePiece = next;
    return true;
  }
  return false;
}

function applyGravity(board) {
  for (let x = 0; x < WIDTH; x += 1) {
    const col = [];
    for (let y = HEIGHT - 1; y >= 0; y -= 1) {
      if (board[y][x]) {
        col.push(board[y][x]);
      }
    }
    for (let y = HEIGHT - 1, i = 0; y >= 0; y -= 1, i += 1) {
      board[y][x] = col[i] || null;
    }
  }
}

function clearRows(state, marks) {
  let lineScore = 0;
  for (let y = 0; y < HEIGHT; y += 1) {
    if (state.board[y].every(Boolean)) {
      lineScore += 100;
      for (let x = 0; x < WIDTH; x += 1) {
        marks.add(`${x},${y}`);
      }
    }
  }
  return lineScore;
}

function findColorGroups(state, marks) {
  const visited = new Set();
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ];

  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const start = state.board[y][x];
      if (!start) {
        continue;
      }
      const key = `${x},${y}`;
      if (visited.has(key)) {
        continue;
      }
      const color = start.color;
      const queue = [[x, y]];
      const group = [];
      visited.add(key);

      while (queue.length > 0) {
        const [cx, cy] = queue.shift();
        group.push([cx, cy]);
        for (const [dx, dy] of dirs) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || nx >= WIDTH || ny < 0 || ny >= HEIGHT) {
            continue;
          }
          const nkey = `${nx},${ny}`;
          if (visited.has(nkey)) {
            continue;
          }
          const cell = state.board[ny][nx];
          if (!cell || cell.color !== color) {
            continue;
          }
          visited.add(nkey);
          queue.push([nx, ny]);
        }
      }

      if (group.length >= 4) {
        for (const [gx, gy] of group) {
          marks.add(`${gx},${gy}`);
        }
      }
    }
  }
}

function recountViruses(state) {
  let count = 0;
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      if (state.board[y][x]?.kind === "virus") {
        count += 1;
      }
    }
  }
  state.virusesRemaining = count;
}

function resolveClears(state) {
  while (true) {
    const marks = new Set();
    let scoreGain = clearRows(state, marks);
    findColorGroups(state, marks);

    if (marks.size === 0) {
      break;
    }

    let removedViruses = 0;
    for (const mark of marks) {
      const [xRaw, yRaw] = mark.split(",");
      const x = Number(xRaw);
      const y = Number(yRaw);
      const cell = state.board[y][x];
      if (cell?.kind === "virus") {
        removedViruses += 1;
      }
      state.board[y][x] = null;
    }

    scoreGain += marks.size * 25 + removedViruses * 100;
    state.score += scoreGain;
    applyGravity(state.board);
    recountViruses(state);
  }

  if (state.virusesRemaining === 0) {
    state.mode = "won";
  }
}

function lockPiece(state) {
  for (const cell of getPieceCells(state.activePiece)) {
    if (cell.y < 0) {
      state.mode = "gameover";
      return;
    }
    state.board[cell.y][cell.x] = { kind: "block", color: cell.color };
  }

  resolveClears(state);
  if (state.mode !== "playing") {
    return;
  }

  state.turnIndex += 1;
  state.activePiece = makePiece(state, state.turnIndex);
  if (collides(state, state.activePiece)) {
    state.mode = "gameover";
  }
}

export function createGame(seed = 1) {
  const state = {
    seed,
    rng: createRng(seed),
    board: createBoard(),
    activePiece: null,
    turnIndex: 0,
    mode: "playing",
    isPaused: false,
    dropAccumulatorMs: 0,
    elapsedMs: 0,
    score: 0,
    virusesRemaining: 0
  };

  spawnViruses(state.board, state.rng);
  recountViruses(state);
  state.activePiece = makePiece(state, state.turnIndex);
  if (collides(state, state.activePiece)) {
    state.mode = "gameover";
  }

  return state;
}

export function getActivePieceSummary(state) {
  return {
    mode: state.activePiece.mode,
    shape: state.activePiece.shape,
    x: state.activePiece.x,
    y: state.activePiece.y
  };
}

export function step(state, ms) {
  if (state.mode !== "playing" || state.isPaused) {
    return;
  }
  state.elapsedMs += ms;
  state.dropAccumulatorMs += ms;

  while (state.dropAccumulatorMs >= DROP_MS && state.mode === "playing" && !state.isPaused) {
    state.dropAccumulatorMs -= DROP_MS;
    if (!tryMove(state, 0, 1)) {
      lockPiece(state);
    }
  }
}

function hardDrop(state) {
  if (state.mode !== "playing" || state.isPaused) {
    return;
  }
  let moved = false;
  while (tryMove(state, 0, 1)) {
    moved = true;
  }
  if (moved) {
    state.score += 5;
  }
  lockPiece(state);
}

function resetState(state) {
  const fresh = createGame(state.seed);
  for (const key of Object.keys(state)) {
    delete state[key];
  }
  Object.assign(state, fresh);
}

export function input(state, command) {
  if (command === "togglePause") {
    if (state.mode === "playing") {
      state.isPaused = !state.isPaused;
    }
    return;
  }

  if (command === "reset") {
    resetState(state);
    return;
  }

  if (command === "restart" && (state.mode === "won" || state.mode === "gameover")) {
    resetState(state);
    return;
  }

  if (state.mode !== "playing" || state.isPaused) {
    return;
  }

  if (command === "moveLeft") {
    tryMove(state, -1, 0);
  } else if (command === "moveRight") {
    tryMove(state, 1, 0);
  } else if (command === "moveDown") {
    if (!tryMove(state, 0, 1)) {
      lockPiece(state);
    }
  } else if (command === "rotate") {
    tryRotate(state);
  } else if (command === "hardDrop") {
    hardDrop(state);
  }
}

export function renderGameToText(state) {
  const piece = getActivePieceSummary(state);
  return [
    "coord=origin_top_left;x+right;y+down",
    `mode=${state.mode}`,
    `paused=${state.isPaused ? 1 : 0}`,
    `score=${state.score}`,
    `viruses=${state.virusesRemaining}`,
    `pieceMode=${piece.mode}`,
    `pieceShape=${piece.shape}`,
    `pieceX=${piece.x}`,
    `pieceY=${piece.y}`,
    `elapsedMs=${Math.round(state.elapsedMs)}`
  ].join("; ");
}
