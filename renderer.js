/* =========================================================
   renderer.js — Rachou | Morpion Kawaii 🌸
   Logique de jeu + IA Minimax imbattable
   ========================================================= */

// ─── ÉTAT DU JEU ───────────────────────────────────────────
let board        = Array(9).fill(null); // null | 'X' | 'O'
let currentPlayer = 'X';               // 'X' toujours humain en solo
let gameOver     = false;
let vsIA         = true;               // mode par défaut : solo
let aiThinking   = false;

const scores = { X: 0, O: 0, draw: 0 };

// ─── COMBINAISONS GAGNANTES ─────────────────────────────────
const WIN_LINES = [
  [0,1,2], [3,4,5], [6,7,8], // lignes
  [0,3,6], [1,4,7], [2,5,8], // colonnes
  [0,4,8], [2,4,6]           // diagonales
];

// ─── SÉLECTEURS DOM ─────────────────────────────────────────
const cells         = document.querySelectorAll('.cell');
const statusEl      = document.getElementById('status');
const btnVsIA       = document.getElementById('btn-vs-ia');
const btnVsHuman    = document.getElementById('btn-vs-human');
const btnRejouer    = document.getElementById('btn-rejouer');
const overlay       = document.getElementById('overlay');
const overlayEmoji  = document.getElementById('overlay-emoji');
const overlayTitle  = document.getElementById('overlay-title');
const overlaySub    = document.getElementById('overlay-sub');
const btnOverlay    = document.getElementById('btn-overlay-rejouer');
const badgeX        = document.getElementById('badge-x');
const badgeO        = document.getElementById('badge-o');
const badgeXLabel   = document.getElementById('badge-x-label');
const badgeOLabel   = document.getElementById('badge-o-label');
const scoreXEl      = document.getElementById('score-x');
const scoreOEl      = document.getElementById('score-o');
const scoreDrawEl   = document.getElementById('score-draw');
const scoreXLabel   = document.getElementById('score-x-label');
const scoreOLabel   = document.getElementById('score-o-label');

// ─── TEXTES EN FRANÇAIS ──────────────────────────────────────
function getStatusText() {
  if (currentPlayer === 'X') {
    return vsIA
      ? "C'est à toi de jouer ! ✨"
      : "C'est au tour de Joueur X ! 🎀";
  } else {
    return vsIA
      ? '<span class="thinking-dots">Rachou réfléchit <span></span><span></span><span></span></span>'
      : "C'est au tour de Joueur O ! 💜";
  }
}

// ─── MISE À JOUR BADGES ──────────────────────────────────────
function updateBadges() {
  if (currentPlayer === 'X') {
    badgeX.classList.add('active');
    badgeO.classList.remove('active');
  } else {
    badgeO.classList.add('active');
    badgeX.classList.remove('active');
  }
}

// ─── MISE À JOUR LABELS SELON LE MODE ────────────────────────
function updateLabels() {
  if (vsIA) {
    badgeXLabel.textContent  = 'Toi';
    badgeOLabel.textContent  = 'Rachou';
    scoreXLabel.textContent  = 'Toi (X)';
    scoreOLabel.textContent  = 'Rachou (O)';
  } else {
    badgeXLabel.textContent  = 'Joueur 1';
    badgeOLabel.textContent  = 'Joueur 2';
    scoreXLabel.textContent  = 'Joueur 1 (X)';
    scoreOLabel.textContent  = 'Joueur 2 (O)';
  }
}

// ─── VÉRIFICATION GAGNANT ────────────────────────────────────
function checkWinner(b) {
  for (const [a, c, d] of WIN_LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) {
      return { winner: b[a], line: [a, c, d] };
    }
  }
  if (b.every(cell => cell !== null)) return { winner: 'draw', line: [] };
  return null;
}

// ─── ALGORITHME MINIMAX (avec élagage alpha-bêta) ────────────
function minimax(b, depth, isMaximizing, alpha, beta) {
  const result = checkWinner(b);

  if (result) {
    if (result.winner === 'O')    return  10 - depth;  // IA gagne → score positif
    if (result.winner === 'X')    return  depth - 10;  // Joueur gagne → score négatif
    if (result.winner === 'draw') return  0;            // Nul → 0
  }

  if (isMaximizing) {
    // Tour de l'IA (O) → maximise le score
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i] === null) {
        b[i] = 'O';
        best = Math.max(best, minimax(b, depth + 1, false, alpha, beta));
        b[i] = null;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break; // élagage bêta
      }
    }
    return best;
  } else {
    // Tour du joueur (X) → minimise le score
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i] === null) {
        b[i] = 'X';
        best = Math.min(best, minimax(b, depth + 1, true, alpha, beta));
        b[i] = null;
        beta = Math.min(beta, best);
        if (beta <= alpha) break; // élagage alpha
      }
    }
    return best;
  }
}

// ─── MEILLEUR COUP POUR L'IA ─────────────────────────────────
function getBestMove(b) {
  let bestScore = -Infinity;
  let bestMove  = -1;

  for (let i = 0; i < 9; i++) {
    if (b[i] === null) {
      b[i] = 'O';
      const score = minimax(b, 0, false, -Infinity, Infinity);
      b[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove  = i;
      }
    }
  }
  return bestMove;
}

// ─── JOUER UN COUP ───────────────────────────────────────────
function playMove(index) {
  if (gameOver || board[index] !== null || aiThinking) return;

  // Place la pièce
  board[index] = currentPlayer;
  renderCell(index, currentPlayer);
  disableCell(index);

  // Vérifie la fin de partie
  const result = checkWinner(board);
  if (result) {
    endGame(result);
    return;
  }

  // Change de joueur
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateBadges();
  statusEl.innerHTML = getStatusText();

  // Si c'est le tour de l'IA
  if (vsIA && currentPlayer === 'O') {
    aiThinking = true;
    disableAllCells(true);

    // Petit délai pour simuler la "réflexion" (~400ms)
    setTimeout(() => {
      const move = getBestMove(board);
      if (move !== -1) {
        board[move] = 'O';
        renderCell(move, 'O');
        disableCell(move);

        const aiResult = checkWinner(board);
        if (aiResult) {
          aiThinking = false;
          endGame(aiResult);
          return;
        }

        currentPlayer = 'X';
        aiThinking    = false;
        disableAllCells(false);
        updateBadges();
        statusEl.innerHTML = getStatusText();
      }
    }, 420);
  }
}

// ─── AFFICHAGE D'UNE CELLULE ──────────────────────────────────
function renderCell(index, player) {
  const cell = cells[index];
  cell.classList.add('taken');
  if (player === 'X') {
    cell.querySelector('.img-x').classList.add('visible');
  } else {
    cell.querySelector('.img-o').classList.add('visible');
  }
}

// ─── DÉSACTIVER UNE CELLULE ───────────────────────────────────
function disableCell(index) {
  cells[index].classList.add('disabled');
}

// ─── ACTIVER / DÉSACTIVER TOUTES LES CELLULES ────────────────
function disableAllCells(disable) {
  cells.forEach(cell => {
    if (!cell.classList.contains('taken')) {
      if (disable) cell.classList.add('disabled');
      else         cell.classList.remove('disabled');
    }
  });
}

// ─── LIGNE GAGNANTE SVG ────────────────────────────────────
function drawWinLine(line) {
  const svg = document.getElementById('win-line-svg');
  svg.innerHTML = '';

  const PAD  = 12;   // padding du grid-wrapper
  const CELL = 110;  // taille d'une cellule
  const GAP  = 8;    // gap entre cellules

  function cellCenter(idx) {
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    return {
      x: PAD + col * (CELL + GAP) + CELL / 2,
      y: PAD + row * (CELL + GAP) + CELL / 2
    };
  }

  const start  = cellCenter(line[0]);
  const end    = cellCenter(line[2]);
  const length = Math.hypot(end.x - start.x, end.y - start.y);

  const lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  lineEl.setAttribute('x1', start.x);
  lineEl.setAttribute('y1', start.y);
  lineEl.setAttribute('x2', end.x);
  lineEl.setAttribute('y2', end.y);
  lineEl.classList.add('win-line');
  lineEl.style.strokeDasharray  = length;
  lineEl.style.strokeDashoffset = length;

  svg.appendChild(lineEl);
  // Force reflow pour déclencher la transition CSS
  lineEl.getBoundingClientRect();
  lineEl.style.strokeDashoffset = 0;
}

function clearWinLine() {
  const svg = document.getElementById('win-line-svg');
  if (svg) svg.innerHTML = '';
}

// ─── FIN DE PARTIE ───────────────────────────────────────────
function endGame(result) {
  gameOver = true;
  disableAllCells(true);

  if (result.winner === 'draw') {
    // Nul
    scores.draw++;
    scoreDrawEl.textContent = scores.draw;
    statusEl.textContent    = "Match nul, on recommence ? 🤝";
    showOverlay('🤝', 'Match Nul !', 'Personne ne gagne cette fois...');
  } else {
    // Victoire
    result.line.forEach(i => cells[i].classList.add('winner'));
    drawWinLine(result.line);
    scores[result.winner]++;
    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;

    if (result.winner === 'X') {
      statusEl.textContent = vsIA
        ? "Bravo, tu as gagné ! 🎉"
        : "Bravo Joueur 1, tu as gagné ! 🎉";
      showOverlay('🎉', 'Bravo !', vsIA ? "Tu as battu Rachou !" : "Joueur 1 remporte la manche !");
    } else {
      statusEl.textContent = vsIA
        ? "Rachou a gagné... 😅 Essaie encore !"
        : "Bravo Joueur 2, tu as gagné ! 🎉";
      showOverlay(
        vsIA ? '🤖' : '🎉',
        vsIA ? 'Rachou gagne !' : 'Bravo Joueur 2 !',
        vsIA ? 'Tu feras mieux la prochaine fois ✨' : 'Joueur 2 remporte la manche !'
      );
    }
  }
}

// ─── OVERLAY ────────────────────────────────────────────────
function showOverlay(emoji, title, sub) {
  overlayEmoji.textContent = emoji;
  overlayTitle.textContent = title;
  overlaySub.textContent   = sub;
  overlay.classList.add('show');
}

function hideOverlay() {
  overlay.classList.remove('show');
}

// ─── RÉINITIALISER LA PARTIE ─────────────────────────────────
function resetGame() {
  board         = Array(9).fill(null);
  currentPlayer = 'X';
  gameOver      = false;
  aiThinking    = false;

  clearWinLine();
  cells.forEach(cell => {
    cell.classList.remove('taken', 'disabled', 'winner');
    cell.querySelector('.img-x').classList.remove('visible');
    cell.querySelector('.img-o').classList.remove('visible');
  });

  hideOverlay();
  updateBadges();
  statusEl.innerHTML = getStatusText();
}

// ─── ÉVÉNEMENTS : BOUTONS DE MODE ───────────────────────────
btnVsIA.addEventListener('click', () => {
  vsIA = true;
  btnVsIA.classList.add('active');
  btnVsHuman.classList.remove('active');
  updateLabels();
  resetGame();
});

btnVsHuman.addEventListener('click', () => {
  vsIA = false;
  btnVsHuman.classList.add('active');
  btnVsIA.classList.remove('active');
  updateLabels();
  resetGame();
});

// ─── ÉVÉNEMENTS : CELLULES ──────────────────────────────────
cells.forEach(cell => {
  cell.addEventListener('click', () => {
    const index = parseInt(cell.getAttribute('data-index'));
    playMove(index);
  });
});

// ─── ÉVÉNEMENTS : BOUTONS REJOUER ───────────────────────────
btnRejouer.addEventListener('click', resetGame);
btnOverlay.addEventListener('click', resetGame);

// ─── INITIALISATION ─────────────────────────────────────────
updateLabels();
updateBadges();
statusEl.innerHTML = getStatusText();
