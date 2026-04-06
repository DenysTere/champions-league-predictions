/* ═══════════════════════════════════════════════
   The Prophet's Bracket — Share Image Generator
   UCL broadcast-style symmetric bracket
   1080 x 1350 (4:5 Instagram)
   ═══════════════════════════════════════════════ */

const ShareUI = {

  openModal() {
    document.getElementById('share-modal').classList.remove('hidden');
    requestAnimationFrame(() => this.generate());
  },
  closeModal() {
    document.getElementById('share-modal').classList.add('hidden');
  },

  async generate() {
    await DATA.preloadLogos();
    const canvas = document.getElementById('share-canvas');
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 1350;
    canvas.width = W; canvas.height = H;

    const user = Store.getUser(); if (!user) return;
    const P = user.picks, R = Store.getResults();
    const sc = Store.calcScore(P);
    const lb = Store.getLeaderboard();
    const me = lb.find(e => e.isCurrentUser);
    const rank = me ? me.rank : '-';
    const F = 'Inter, -apple-system, sans-serif';
    const qf = DATA.bracket.quarterFinals;

    // ═══ Seeded random for stars ═══
    let _s = 999;
    const sr = () => { _s = (_s * 16807) % 2147483647; return _s / 2147483647; };

    // ═══════════════════════════
    //  BACKGROUND — UCL blue
    // ═══════════════════════════
    const bg = ctx.createRadialGradient(W / 2, H * .28, 0, W / 2, H * .28, W * .95);
    bg.addColorStop(0, '#1e2b8a');
    bg.addColorStop(.5, '#151f72');
    bg.addColorStop(1, '#0a0f4a');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Starfield
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = 'rgba(255,255,255,' + (sr() * .1 + .02) + ')';
      ctx.beginPath();
      ctx.arc(sr() * W, sr() * H, sr() * 1.3 + .3, 0, Math.PI * 2);
      ctx.fill();
    }

    // ═══════════════════════════
    //  HEADER
    // ═══════════════════════════
    ctx.textAlign = 'center';

    // UCL stars icon (text approximation)
    ctx.fillStyle = '#fff';
    ctx.font = '24px sans-serif';
    ctx.fillText('\u2B50', W / 2 - 180, 52);

    ctx.fillStyle = '#fff';
    ctx.font = '800 50px ' + F;
    ctx.fillText('CHAMPIONS LEAGUE', W / 2, 65);

    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.font = '600 15px ' + F;
    ctx.fillText("THE PROPHET\u2019S BRACKET  \u2022  " + user.displayName.toUpperCase(), W / 2, 98);

    // ═══════════════════════════
    //  POSITION CONSTANTS
    // ═══════════════════════════
    const CR = { qf: 48, sf: 52, fin: 42 };
    const LQF = 112, LSF = 308, CX = W / 2, RSF = W - 308, RQF = W - 112;
    const YQ = [240, 408, 590, 758];
    const YS = [(YQ[0] + YQ[1]) / 2, (YQ[2] + YQ[3]) / 2]; // 324, 674
    const YF = (YS[0] + YS[1]) / 2; // 499

    // Finalist card geometry
    const FW = 128, FH = 136, FGAP = 10;
    const LF_CX = CX - FW / 2 - FGAP, RF_CX = CX + FW / 2 + FGAP;
    const F_TOP = YF - FH / 2;

    // Trophy Y
    const TY = F_TOP + FH + 40;

    // ═══════════════════════════
    //  BRACKET LINES — clean white
    // ═══════════════════════════
    const LN = 'rgba(255,255,255,.22)';
    const LW = 'rgba(255,255,255,.55)';
    ctx.lineCap = 'round';

    // Left QF → SF
    _bLine(ctx, LQF + CR.qf, YQ[0], YQ[1], LSF - CR.sf, YS[0], LN, LW, P.qf1 === qf[0].home, P.qf1 === qf[0].away);
    _bLine(ctx, LQF + CR.qf, YQ[2], YQ[3], LSF - CR.sf, YS[1], LN, LW, P.qf2 === qf[1].home, P.qf2 === qf[1].away);

    // Left SF → Left finalist card
    _bLine(ctx, LSF + CR.sf, YS[0], YS[1], LF_CX - FW / 2, YF, LN, LW, P.sf1 === P.qf1, P.sf1 === P.qf2);

    // Right QF → SF
    _bLine(ctx, RQF - CR.qf, YQ[0], YQ[1], RSF + CR.sf, YS[0], LN, LW, P.qf3 === qf[2].home, P.qf3 === qf[2].away);
    _bLine(ctx, RQF - CR.qf, YQ[2], YQ[3], RSF + CR.sf, YS[1], LN, LW, P.qf4 === qf[3].home, P.qf4 === qf[3].away);

    // Right SF → Right finalist card
    _bLine(ctx, RSF - CR.sf, YS[0], YS[1], RF_CX + FW / 2, YF, LN, LW, P.sf2 === P.qf3, P.sf2 === P.qf4);

    // Finalist cards → Trophy (vertical converging lines)
    ctx.strokeStyle = LN; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(LF_CX, F_TOP + FH); ctx.lineTo(LF_CX, TY - 8); ctx.lineTo(CX, TY - 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(RF_CX, F_TOP + FH); ctx.lineTo(RF_CX, TY - 8); ctx.lineTo(CX, TY - 8); ctx.stroke();

    // Highlight champion path
    if (P.final) {
      ctx.strokeStyle = LW; ctx.lineWidth = 3;
      const winCX = P.final === P.sf1 ? LF_CX : RF_CX;
      ctx.beginPath(); ctx.moveTo(winCX, F_TOP + FH); ctx.lineTo(winCX, TY - 8); ctx.lineTo(CX, TY - 8); ctx.stroke();
    }

    // ═══════════════════════════
    //  TEAM CRESTS — bold colored circles
    // ═══════════════════════════

    // Left QF
    _badge(ctx, LQF, YQ[0], CR.qf, qf[0].home, P.qf1 === qf[0].home, R.qf1, F);
    _badge(ctx, LQF, YQ[1], CR.qf, qf[0].away, P.qf1 === qf[0].away, R.qf1, F);
    _badge(ctx, LQF, YQ[2], CR.qf, qf[1].home, P.qf2 === qf[1].home, R.qf2, F);
    _badge(ctx, LQF, YQ[3], CR.qf, qf[1].away, P.qf2 === qf[1].away, R.qf2, F);

    // Left SF
    if (P.qf1) _badge(ctx, LSF, YS[0], CR.sf, P.qf1, P.sf1 === P.qf1, R.sf1, F);
    if (P.qf2) _badge(ctx, LSF, YS[1], CR.sf, P.qf2, P.sf1 === P.qf2, R.sf1, F);

    // Right QF
    _badge(ctx, RQF, YQ[0], CR.qf, qf[2].home, P.qf3 === qf[2].home, R.qf3, F);
    _badge(ctx, RQF, YQ[1], CR.qf, qf[2].away, P.qf3 === qf[2].away, R.qf3, F);
    _badge(ctx, RQF, YQ[2], CR.qf, qf[3].home, P.qf4 === qf[3].home, R.qf4, F);
    _badge(ctx, RQF, YQ[3], CR.qf, qf[3].away, P.qf4 === qf[3].away, R.qf4, F);

    // Right SF
    if (P.qf3) _badge(ctx, RSF, YS[0], CR.sf, P.qf3, P.sf2 === P.qf3, R.sf2, F);
    if (P.qf4) _badge(ctx, RSF, YS[1], CR.sf, P.qf4, P.sf2 === P.qf4, R.sf2, F);

    // ═══════════════════════════
    //  FINALIST CARDS — white panels
    // ═══════════════════════════
    if (P.sf1) _finCard(ctx, LF_CX, YF, FW, FH, P.sf1, P.final === P.sf1, R.final, F);
    if (P.sf2) _finCard(ctx, RF_CX, YF, FW, FH, P.sf2, P.final === P.sf2, R.final, F);

    // ═══════════════════════════
    //  FINAL BADGE
    // ═══════════════════════════
    const bW = 100, bH = 28, bY = F_TOP - 42;
    roundRect(ctx, CX - bW / 2, bY, bW, bH, 6);
    const bd = ctx.createLinearGradient(CX - bW / 2, bY, CX + bW / 2, bY + bH);
    bd.addColorStop(0, '#7c3aed'); bd.addColorStop(1, '#4f46e5');
    ctx.fillStyle = bd; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '700 12px ' + F; ctx.textAlign = 'center';
    ctx.fillText('FINAL', CX, bY + 19);

    // ═══════════════════════════
    //  TROPHY + CHAMPION
    // ═══════════════════════════
    ctx.font = '80px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('\uD83C\uDFC6', CX, TY + 30);

    if (P.final && DATA.teams[P.final]) {
      const ch = DATA.teams[P.final];
      const ok = R.final ? P.final === R.final : null;
      ctx.fillStyle = ok === true ? '#34d399' : ok === false ? '#f87171' : '#fff';
      ctx.font = '800 22px ' + F;
      ctx.fillText(ch.name.toUpperCase(), CX, TY + 76);
      ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.font = '500 12px ' + F;
      ctx.fillText(ok === true ? 'CORRECT!' : ok === false ? 'WRONG PREDICTION' : 'PREDICTED CHAMPION', CX, TY + 98);
    }

    // ═══════════════════════════
    //  ROUND LABELS
    // ═══════════════════════════
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.font = '600 14px ' + F; ctx.textAlign = 'center';
    ctx.fillText('Quarterfinals', LQF, YQ[3] + CR.qf + 30);
    ctx.fillText('Semifinals', LSF, YS[1] + CR.sf + 30);
    ctx.fillText('Semifinals', RSF, YS[1] + CR.sf + 30);
    ctx.fillText('Quarterfinals', RQF, YQ[3] + CR.qf + 30);

    // ═══════════════════════════
    //  STATS BAR
    // ═══════════════════════════
    const sy = 990;
    roundRect(ctx, 60, sy, W - 120, 95, 16);
    ctx.fillStyle = 'rgba(0,0,20,.35)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1; ctx.stroke();

    const sX = [W * .22, W * .5, W * .78];
    const sV = ['#' + rank, sc.score + '/22', sc.correct + '/' + sc.total];
    const sL = ['RANK', 'POINTS', 'CORRECT'];
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#fff'; ctx.font = '800 32px ' + F; ctx.textAlign = 'center';
      ctx.fillText(sV[i], sX[i], sy + 44);
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.font = '700 10px ' + F;
      ctx.fillText(sL[i], sX[i], sy + 66);
    }
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * .37, sy + 18); ctx.lineTo(W * .37, sy + 76); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * .63, sy + 18); ctx.lineTo(W * .63, sy + 76); ctx.stroke();

    // ═══════════════════════════
    //  FOOTER
    // ═══════════════════════════
    if (user.referralCode) {
      ctx.fillStyle = '#fff'; ctx.font = '800 28px ' + F; ctx.textAlign = 'center';
      ctx.fillText(user.referralCode, CX, 1160);
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.font = '500 12px ' + F;
      ctx.fillText('USE THIS CODE TO JOIN', CX, 1184);
    }

    // Branding
    ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = '700 13px ' + F;
    ctx.fillText('\u25C6  LIMITLESS', 60, H - 50);
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.font = '400 12px ' + F;
    ctx.fillText('limitless.exchange', 60, H - 30);

    ctx.textAlign = 'right';
    ctx.fillText(lb.length + ' participants', W - 60, H - 30);
  },

  /* ═══════════════════════════════════════════
     INLINE CANVAS — left-to-right for page
     ═══════════════════════════════════════════ */
  renderInline(container) {
    const wrap = document.createElement('div');
    wrap.className = 'btree-canvas-wrap';
    const canvas = document.createElement('canvas');
    canvas.className = 'btree-canvas';
    wrap.appendChild(canvas);
    container.appendChild(wrap);

    const w = wrap.clientWidth || 580;
    const ratio = w < 500 ? .85 : .65;
    const h = Math.max(360, Math.round(w * ratio));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const user = Store.getUser(); if (!user) return;
    const P = user.picks, R = Store.getResults();
    const F = 'Inter, -apple-system, sans-serif';
    const C = {
      bg: '#121a60', card: '#1a2580', cardBorder: 'rgba(255,255,255,.15)',
      gold: '#c9a84c', goldBg: 'rgba(255,255,255,.12)',
      txt: '#fff', txt2: 'rgba(255,255,255,.7)', txt3: 'rgba(255,255,255,.35)',
      green: '#34d399', greenBg: 'rgba(52,211,153,.15)',
      red: '#f87171', redBg: 'rgba(248,113,113,.15)',
      line: 'rgba(255,255,255,.18)', lineWin: 'rgba(255,255,255,.55)',
    };
    const ibg = ctx.createLinearGradient(0, 0, w, h);
    ibg.addColorStop(0, '#1a2580'); ibg.addColorStop(1, '#0e1755');
    ctx.fillStyle = ibg; ctx.fillRect(0, 0, w, h);

    const small = w < 420;
    const BX = small ? Math.floor((w - 36) / 4.6) : Math.floor((w - 60) / 4.4);
    const BH = small ? 24 : 30;
    const GAP = small ? 8 : 16;
    const fs = small ? 10 : 12;
    const totalW = BX * 4 + GAP * 3;
    const mx = Math.floor((w - totalW) / 2);
    const col = [mx, mx + BX + GAP, mx + 2 * (BX + GAP), mx + 3 * (BX + GAP)];
    const treeTop = 28, treeBot = h - 20, treeH = treeBot - treeTop, step = treeH / 7;

    const yQF = []; for (let i = 0; i < 8; i++) yQF.push(treeTop + i * step);
    const yC1 = []; for (let i = 0; i < 4; i++) yC1.push((yQF[i * 2] + yQF[i * 2 + 1]) / 2);
    const yC2 = [(yC1[0] + yC1[1]) / 2, (yC1[2] + yC1[3]) / 2];
    const yCh = (yC2[0] + yC2[1]) / 2;

    ctx.fillStyle = C.txt3; ctx.font = '700 ' + (small ? 8 : 10) + 'px ' + F; ctx.textAlign = 'center';
    ctx.fillText('QF', col[0] + BX / 2, treeTop - 8);
    ctx.fillText('SF', col[1] + BX / 2, treeTop - 8);
    ctx.fillText('FINAL', col[2] + BX / 2, treeTop - 8);
    ctx.fillStyle = C.gold; ctx.fillText('\uD83C\uDFC6', col[3] + BX / 2, treeTop - 6);

    const qf = DATA.bracket.quarterFinals;
    for (let m = 0; m < 4; m++) {
      const w2 = P['qf' + (m + 1)];
      _connI(ctx, col[0] + BX, yQF[m * 2], yQF[m * 2 + 1], col[1], yC1[m], C.line, C.lineWin, w2 === qf[m].home, w2 === qf[m].away);
    }
    for (let s = 0; s < 2; s++) {
      const t = P['qf' + (s * 2 + 1)], b = P['qf' + (s * 2 + 2)], sw = P['sf' + (s + 1)];
      if (t && b) _connI(ctx, col[1] + BX, yC1[s * 2], yC1[s * 2 + 1], col[2], yC2[s], C.line, C.lineWin, sw === t, sw === b);
    }
    if (P.sf1 && P.sf2) _connI(ctx, col[2] + BX, yC2[0], yC2[1], col[3], yCh, C.line, C.lineWin, P.final === P.sf1, P.final === P.sf2);

    for (let i = 0; i < 8; i++) {
      const m = Math.floor(i / 2), tid = i % 2 === 0 ? qf[m].home : qf[m].away;
      _boxI(ctx, col[0], yQF[i] - BH / 2, BX, BH, tid, P['qf' + (m + 1)] === tid, R['qf' + (m + 1)], C, F, fs, small);
    }
    for (let i = 0; i < 4; i++) {
      const tid = P['qf' + (i + 1)], sIdx = Math.floor(i / 2), sId = 'sf' + (sIdx + 1);
      if (tid) _boxI(ctx, col[1], yC1[i] - BH / 2, BX, BH, tid, P[sId] === tid, R[sId], C, F, fs, small);
      else _emptyI(ctx, col[1], yC1[i] - BH / 2, BX, BH, C);
    }
    for (let i = 0; i < 2; i++) {
      const tid = P['sf' + (i + 1)];
      if (tid) _boxI(ctx, col[2], yC2[i] - BH / 2, BX, BH, tid, P.final === tid, R.final, C, F, fs, small);
      else _emptyI(ctx, col[2], yC2[i] - BH / 2, BX, BH, C);
    }
    if (P.final && DATA.teams[P.final]) {
      const team = DATA.teams[P.final], res = R.final, ok = res ? P.final === res : null;
      const ac = ok === true ? C.green : ok === false ? C.red : C.gold;
      const acB = ok === true ? C.greenBg : ok === false ? C.redBg : C.goldBg;
      const ch = BH * 1.5, cy = yCh - ch / 2;
      roundRect(ctx, col[3], cy, BX, ch, 6);
      ctx.fillStyle = acB; ctx.fill(); ctx.strokeStyle = ac; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.textAlign = 'center'; ctx.fillStyle = ac;
      ctx.font = (small ? 14 : 18) + 'px sans-serif';
      ctx.fillText('\uD83C\uDFC6', col[3] + BX / 2, cy + ch / 2 - (small ? 2 : 4));
      ctx.font = '700 ' + (small ? 8 : 11) + 'px ' + F;
      ctx.fillText(small ? team.short : team.name, col[3] + BX / 2, cy + ch / 2 + (small ? 12 : 16));
    }
  },

  download() {
    const a = document.createElement('a');
    a.download = 'prophets-bracket.png';
    a.href = document.getElementById('share-canvas').toDataURL('image/png');
    a.click(); App.toast('Image downloaded!');
  },
  copyLink() {
    const u = Store.getUser();
    const ref = u && u.referralCode ? '?ref=' + u.referralCode : '';
    navigator.clipboard.writeText(window.location.origin + window.location.pathname + ref)
      .then(() => App.toast('Link copied!'), () => App.toast('Could not copy'));
  },
};


/* ══════════════════════════════════════════════
   SHARE IMAGE HELPERS
   ══════════════════════════════════════════════ */

/* ── Team badge: draw logo image ── */
function _badge(ctx, cx, cy, r, teamId, isPicked, matchResult, font) {
  const team = DATA.teams[teamId]; if (!team) return;
  const logo = DATA.getLogo(teamId);
  const alpha = isPicked ? 1 : (matchResult ? .3 : .5);

  ctx.save(); ctx.globalAlpha = alpha;

  if (logo) {
    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 3;
    // Draw logo image
    ctx.drawImage(logo, cx - r, cy - r, r * 2, r * 2);
    ctx.shadowBlur = 0;
  } else {
    // Fallback: colored circle
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = team.color; ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '800 ' + Math.round(r * .42) + 'px ' + font;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(team.short, cx, cy + 1);
    ctx.textBaseline = 'alphabetic';
  }

  // Result indicator ring
  if (isPicked && matchResult) {
    ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
    ctx.strokeStyle = teamId === matchResult ? '#34d399' : '#f87171';
    ctx.lineWidth = 4; ctx.stroke();
  }

  // Team name below
  ctx.globalAlpha = Math.max(alpha - .1, .25);
  ctx.fillStyle = '#fff';
  ctx.font = '600 ' + Math.round(r * .24) + 'px ' + font;
  ctx.textAlign = 'center';
  ctx.fillText(team.name, cx, cy + r + Math.round(r * .4));

  ctx.restore();
}

/* ── Finalist white card ── */
function _finCard(ctx, cx, cy, w, h, teamId, isPicked, matchResult, font) {
  const team = DATA.teams[teamId]; if (!team) return;
  const x = cx - w / 2, y = cy - h / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 4;

  // White card
  roundRect(ctx, x, y, w, h, 14);
  ctx.fillStyle = '#fff'; ctx.fill();
  ctx.shadowBlur = 0;

  // Result border
  if (isPicked && matchResult) {
    ctx.strokeStyle = teamId === matchResult ? '#34d399' : '#f87171';
    ctx.lineWidth = 3; ctx.stroke();
  }

  // Team logo inside card
  const cr = Math.min(w, h) * .28;
  const logo = DATA.getLogo(teamId);
  if (logo) {
    ctx.drawImage(logo, cx - cr, cy - 14 - cr, cr * 2, cr * 2);
  } else {
    ctx.beginPath(); ctx.arc(cx, cy - 14, cr, 0, Math.PI * 2);
    ctx.fillStyle = team.color; ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '800 ' + Math.round(cr * .5) + 'px ' + font;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(team.short, cx, cy - 13);
    ctx.textBaseline = 'alphabetic';
  }

  // Team name below logo
  ctx.fillStyle = '#333';
  ctx.font = '700 11px ' + font; ctx.textAlign = 'center';
  ctx.fillText(team.name, cx, y + h - 14);

  ctx.restore();
}

/* ── Bracket connector line ── */
function _bLine(ctx, fromX, yTop, yBot, toX, yMid, lineCol, winCol, topW, botW) {
  const mx = Math.round((fromX + toX) / 2);
  ctx.setLineDash([]);

  ctx.strokeStyle = lineCol; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(fromX, yTop); ctx.lineTo(mx, yTop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(fromX, yBot); ctx.lineTo(mx, yBot); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(mx, yTop); ctx.lineTo(mx, yBot); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(mx, yMid); ctx.lineTo(toX, yMid); ctx.stroke();

  if (topW || botW) {
    ctx.strokeStyle = winCol; ctx.lineWidth = 3.5;
    const wy = topW ? yTop : yBot;
    ctx.beginPath(); ctx.moveTo(fromX, wy); ctx.lineTo(mx, wy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx, wy); ctx.lineTo(mx, yMid); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx, yMid); ctx.lineTo(toX, yMid); ctx.stroke();
  }
}


/* ══════════════════════════════════════════════
   INLINE CANVAS HELPERS
   ══════════════════════════════════════════════ */

function _connI(ctx, fromX, yT, yB, toX, yM, lc, wc, tW, bW) {
  const mx = Math.round((fromX + toX) / 2);
  ctx.setLineDash([]); ctx.strokeStyle = lc; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(fromX, yT); ctx.lineTo(mx, yT); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(fromX, yB); ctx.lineTo(mx, yB); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(mx, yT); ctx.lineTo(mx, yB); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(mx, yM); ctx.lineTo(toX, yM); ctx.stroke();
  if (tW || bW) {
    ctx.strokeStyle = wc; ctx.lineWidth = 2.5;
    const wy = tW ? yT : yB;
    ctx.beginPath(); ctx.moveTo(fromX, wy); ctx.lineTo(mx, wy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx, wy); ctx.lineTo(mx, yM); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx, yM); ctx.lineTo(toX, yM); ctx.stroke();
  }
}

function _boxI(ctx, x, y, w, h, teamId, isPicked, result, C, font, fs, useShort) {
  const team = DATA.teams[teamId]; if (!team) return;
  let bg = 'rgba(255,255,255,.08)', border = C.cardBorder, txt = C.txt2, icon = '';
  if (isPicked) {
    if (result) {
      if (teamId === result) { bg = C.greenBg; border = C.green; txt = C.green; icon = '\u2713'; }
      else { bg = C.redBg; border = C.red; txt = C.red; icon = '\u2717'; }
    } else { bg = 'rgba(255,255,255,.18)'; border = 'rgba(255,255,255,.35)'; txt = '#fff'; icon = '\u25C6'; }
  }
  roundRect(ctx, x, y, w, h, 5); ctx.fillStyle = bg; ctx.fill();
  ctx.strokeStyle = border; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = team.color; roundRect(ctx, x, y, 4, h, [3, 0, 0, 3]); ctx.fill();
  ctx.fillStyle = txt; ctx.font = (isPicked ? '600 ' : '400 ') + fs + 'px ' + font; ctx.textAlign = 'left';
  ctx.fillText(useShort ? team.short : team.name, x + 10, y + h / 2 + fs * .36);
  if (icon) { ctx.textAlign = 'right'; ctx.fillText(icon, x + w - 6, y + h / 2 + fs * .36); }
  ctx.textAlign = 'left';
}

function _emptyI(ctx, x, y, w, h, C) {
  roundRect(ctx, x, y, w, h, 5); ctx.fillStyle = C.card; ctx.fill();
  ctx.strokeStyle = C.cardBorder; ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = C.txt3; ctx.font = '400 11px Inter,sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('TBD', x + w / 2, y + h / 2 + 4); ctx.textAlign = 'left';
}


/* ══════════════════════════════════════════════
   roundRect with per-corner support
   ══════════════════════════════════════════════ */
function roundRect(ctx, x, y, w, h, r) {
  if (Array.isArray(r)) {
    const [tl, tr, br, bl] = r;
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y); ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
    ctx.lineTo(x + w, y + h - br); ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    ctx.lineTo(x + bl, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
    ctx.lineTo(x, y + tl); ctx.quadraticCurveTo(x, y, x + tl, y);
    ctx.closePath(); return;
  }
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return; }
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
