/* ═══════════════════════════════════════════════
   The Prophet's Bracket — Visual Bracket
   Classic symmetric UCL bracket with real crests
   ═══════════════════════════════════════════════ */

const BracketUI = {

  render(container, opts) {
    const vo = opts && opts.viewOnly;
    const user = Store.getUser();
    const P = user ? { ...user.picks } : {};
    const L = (user ? user.locked : false) || vo;
    const R = Store.getResults();
    const qf = DATA.bracket.quarterFinals;

    // Team name helper
    const nm = id => DATA.teams[id] ? DATA.teams[id].short : '';

    let h = '';
    h += '<div class="bk">';

    // ═══ LEFT SIDE ═══
    // QF Round (4 teams, 2 matches)
    h += '<div class="bk-col bk-col-teams">';
    h += '<div class="bk-label">Quarterfinals</div>';
    h += this._matchup(qf[0].home, qf[0].away, 'qf1', P, L, R);
    h += this._matchup(qf[1].home, qf[1].away, 'qf2', P, L, R);
    h += '</div>';

    // QF→SF connectors
    h += '<div class="bk-col bk-col-lines">';
    h += '<div class="bk-connector bk-conn-r"></div>';
    h += '<div class="bk-connector bk-conn-r"></div>';
    h += '</div>';

    // SF Round (2 slots)
    h += '<div class="bk-col bk-col-slots">';
    h += '<div class="bk-label">Semifinals</div>';
    h += this._slotBox(P.qf1, 'sf1', P, L, R);
    h += this._slotBox(P.qf2, 'sf1', P, L, R);
    h += '</div>';

    // SF→Final connector
    h += '<div class="bk-col bk-col-lines">';
    h += '<div class="bk-connector bk-conn-r bk-conn-tall"></div>';
    h += '</div>';

    // Left finalist slot
    h += '<div class="bk-col bk-col-slots">';
    h += this._slotBox(P.sf1, 'final', P, L, R);
    h += '</div>';

    // ═══ CENTER ═══
    h += '<div class="bk-col bk-col-center">';
    h += '<div class="bk-center-line"></div>';
    h += '<div class="bk-final-badge">FINAL</div>';
    if (P.final && DATA.teams[P.final]) {
      h += '<div class="bk-winner">';
      h += '<img src="' + DATA.teams[P.final].logo + '" class="bk-winner-img" alt="">';
      h += '<div class="bk-winner-name">' + DATA.teams[P.final].name + '</div>';
      h += '</div>';
    }
    h += '</div>';

    // ═══ RIGHT SIDE ═══
    // Right finalist slot
    h += '<div class="bk-col bk-col-slots">';
    h += this._slotBox(P.sf2, 'final', P, L, R);
    h += '</div>';

    // Final→SF connector
    h += '<div class="bk-col bk-col-lines">';
    h += '<div class="bk-connector bk-conn-l bk-conn-tall"></div>';
    h += '</div>';

    // SF Round right (2 slots)
    h += '<div class="bk-col bk-col-slots">';
    h += '<div class="bk-label">Semifinals</div>';
    h += this._slotBox(P.qf3, 'sf2', P, L, R);
    h += this._slotBox(P.qf4, 'sf2', P, L, R);
    h += '</div>';

    // SF→QF connectors right
    h += '<div class="bk-col bk-col-lines">';
    h += '<div class="bk-connector bk-conn-l"></div>';
    h += '<div class="bk-connector bk-conn-l"></div>';
    h += '</div>';

    // QF Round right (4 teams)
    h += '<div class="bk-col bk-col-teams">';
    h += '<div class="bk-label">Quarterfinals</div>';
    h += this._matchup(qf[2].home, qf[2].away, 'qf3', P, L, R);
    h += this._matchup(qf[3].home, qf[3].away, 'qf4', P, L, R);
    h += '</div>';

    h += '</div>';

    // Lock button
    if (!L && P.final) {
      h += '<button class="btn btn-gold btn-lock" onclick="App.lockBracket()">Lock My Bracket</button>';
    }

    container.innerHTML = h;
  },

  // Two teams in a QF matchup
  _matchup(homeId, awayId, matchId, P, L, R) {
    return '<div class="bk-matchup">' +
      this._team(homeId, matchId, P, L, R) +
      this._team(awayId, matchId, P, L, R) +
    '</div>';
  },

  // Single team with crest + name
  _team(tid, mid, P, L, R) {
    const t = DATA.teams[tid]; if (!t) return '';
    const sel = P[mid] === tid;
    let cls = 'bk-team';
    if (sel) cls += ' bk-picked';
    if (L) cls += ' bk-locked';
    if (sel && R[mid]) cls += tid === R[mid] ? ' bk-correct' : ' bk-wrong';
    const ck = L ? '' : " onclick=\"App.pickTeam('" + mid + "','" + tid + "')\"";
    return '<div class="' + cls + '"' + ck + '>' +
      '<img class="bk-crest" src="' + t.logo + '" alt="' + t.short + '">' +
      '<span class="bk-name">' + t.short + '</span>' +
    '</div>';
  },

  // Slot box (empty or filled with a picked team)
  _slotBox(tid, nextMid, P, L, R) {
    if (!tid || !DATA.teams[tid]) {
      return '<div class="bk-slot bk-slot-empty"></div>';
    }
    const t = DATA.teams[tid];
    const sel = P[nextMid] === tid;
    let cls = 'bk-slot bk-slot-filled';
    if (sel) cls += ' bk-picked';
    if (L) cls += ' bk-locked';
    const ck = L ? '' : " onclick=\"App.pickTeam('" + nextMid + "','" + tid + "')\"";
    return '<div class="' + cls + '"' + ck + '>' +
      '<img class="bk-slot-crest" src="' + t.logo + '" alt="' + t.short + '">' +
    '</div>';
  },
};
