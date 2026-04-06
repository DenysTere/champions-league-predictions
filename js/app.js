/* ═══════════════════════════════════════════════
   The Prophet's Bracket — Main App
   Routing, init, global actions, admin panel
   ═══════════════════════════════════════════════ */

const App = {
  current: 'landing',
  _toastTimer: null,

  /* ── Init ── */
  init() {
    // Preload team logos for canvas drawing
    DATA.preloadLogos();

    // Pre-fill referral code from URL ?ref=GARY10
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      const inp = document.getElementById('entry-ref');
      if (inp) inp.value = ref.toUpperCase();
    }

    // Render creator chips on landing
    this._renderCreatorChips();

    // Check for existing user
    const user = Store.getUser();
    if (user && user.locked) {
      this._showNav();
      this.navigate('my-bracket');
    } else if (user) {
      this._showNav();
      this.navigate('bracket');
    } else {
      this.navigate('landing');
    }

    // Allow Enter key on entry form
    document.getElementById('entry-name').addEventListener('keydown', e => {
      if (e.key === 'Enter') this.startBracket();
    });
    document.getElementById('entry-ref').addEventListener('keydown', e => {
      if (e.key === 'Enter') this.startBracket();
    });
  },

  /* ── Navigation ── */
  navigate(view) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const el = document.getElementById('view-' + view);
    if (!el) return;
    el.classList.remove('hidden');
    this.current = view;

    // Update nav active state
    document.querySelectorAll('.bnav-item').forEach(item =>
      item.classList.toggle('active', item.dataset.view === view)
    );

    // Render view content
    switch (view) {
      case 'bracket':
        BracketUI.render(document.getElementById('bracket-container'));
        break;
      case 'my-bracket':
        this._renderMyBracket();
        break;
      case 'leaderboard':
        LeaderboardUI.render(document.getElementById('leaderboard-container'));
        break;
      case 'admin':
        this._renderAdmin();
        break;
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
  },

  _showNav() { document.getElementById('bottom-nav').classList.remove('hidden'); },
  _hideNav() { document.getElementById('bottom-nav').classList.add('hidden'); },

  /* ── Entry flow ── */
  startBracket() {
    const nameEl = document.getElementById('entry-name');
    const refEl  = document.getElementById('entry-ref');
    const name = nameEl.value.trim();
    const ref  = refEl.value.trim().toUpperCase();

    if (!name) {
      nameEl.focus();
      this.toast('Enter your display name');
      return;
    }

    Store.createUser(name, ref || null);
    this._showNav();
    this.navigate('bracket');
    this.toast('Let\'s go! Pick your winners.');
  },

  /* ── Pick team ── */
  pickTeam(matchId, teamId) {
    const user = Store.savePick(matchId, teamId);
    if (user) BracketUI.render(document.getElementById('bracket-container'));
  },

  /* ── Lock bracket ── */
  lockBracket() {
    const user = Store.getUser();
    if (!user || !user.picks.final) return;
    if (!confirm('Lock your bracket? You won\'t be able to change your picks.')) return;

    Store.lockBracket();
    this.navigate('my-bracket');
    this.toast('Bracket locked! Good luck \u{1F91E}');
  },

  /* ── My Bracket view ── */
  _renderMyBracket() {
    const c = document.getElementById('my-bracket-container');
    const user = Store.getUser();

    if (!user || !user.locked) {
      c.innerHTML = '<div class="text-center" style="padding:60px 0">' +
        '<p class="text-muted">No bracket locked yet.</p>' +
        '<button class="btn btn-gold mt-16" onclick="App.navigate(\'bracket\')">Build Your Bracket</button></div>';
      return;
    }

    const s = Store.calcScore(user.picks);
    const lb = Store.getLeaderboard();
    const me = lb.find(e => e.isCurrentUser);
    const rank = me ? me.rank : '-';
    const total = lb.length;

    let h = '<div class="my-bracket-header">' +
      '<h1>' + esc(user.displayName) + '\'s Bracket</h1>' +
      '<p>Locked ' + new Date(user.lockedAt).toLocaleDateString() + '</p>' +
    '</div>';

    // Score cards
    h += '<div class="score-card">' +
      '<div class="score-item"><div class="score-value">#' + rank + '</div><div class="score-label">Rank</div></div>' +
      '<div class="score-item"><div class="score-value">' + s.score + '</div><div class="score-label">Points</div></div>' +
      '<div class="score-item"><div class="score-value">' + s.correct + '/' + s.total + '</div><div class="score-label">Correct</div></div>' +
    '</div>';

    // Referral tag
    if (user.referralCode) {
      h += '<div class="referral-card"><p>Referred by</p>' +
        '<div class="referral-code">' + esc(user.referralCode) + '</div></div>';
    }

    // Actions
    h += '<div class="my-bracket-actions">' +
      '<button class="btn btn-gold" onclick="ShareUI.openModal()">Share Bracket</button>' +
      '<button class="btn btn-outline" onclick="App.navigate(\'leaderboard\')">Leaderboard</button>' +
    '</div>';

    c.innerHTML = h;

    // Render bracket tree (view-only)
    const bracketDiv = document.createElement('div');
    c.appendChild(bracketDiv);
    BracketUI.render(bracketDiv, { viewOnly: true });
  },

  /* ── Admin panel ── */
  _renderAdmin() {
    const c = document.getElementById('admin-container');
    const results = Store.getResults();
    let h = '';

    // QF section
    h += '<div class="admin-section-title">Quarter-Finals</div>';
    DATA.bracket.quarterFinals.forEach(m => {
      h += this._adminMatch(m.id, m.home, m.away, results);
    });

    // SF section — only if all QF results are set
    const qfDone = DATA.bracket.quarterFinals.every(m => results[m.id]);
    if (qfDone) {
      h += '<div class="admin-section-title">Semi-Finals</div>';
      DATA.bracket.semiFinals.forEach(sf => {
        const hId = results[sf.from[0]];
        const aId = results[sf.from[1]];
        if (hId && aId) h += this._adminMatch(sf.id, hId, aId, results);
      });
    }

    // Final — only if all SF results are set
    const sfDone = qfDone && DATA.bracket.semiFinals.every(sf => results[sf.id]);
    if (sfDone) {
      h += '<div class="admin-section-title">Final</div>';
      const hId = results.sf1;
      const aId = results.sf2;
      if (hId && aId) h += this._adminMatch('final', hId, aId, results);
    }

    c.innerHTML = h;
  },

  _adminMatch(id, homeId, awayId, results) {
    const home = DATA.teams[homeId];
    const away = DATA.teams[awayId];
    if (!home || !away) return '';
    const label = id.replace('qf', 'QF ').replace('sf', 'SF ').replace('final', 'FINAL').toUpperCase();

    return '<div class="admin-match">' +
      '<div class="admin-match-label">' + label + '</div>' +
      '<div class="admin-match-options">' +
        '<button class="admin-team-btn' + (results[id] === homeId ? ' active' : '') + '" onclick="App.setResult(\'' + id + '\',\'' + homeId + '\')">' + home.name + '</button>' +
        '<button class="admin-team-btn' + (results[id] === awayId ? ' active' : '') + '" onclick="App.setResult(\'' + id + '\',\'' + awayId + '\')">' + away.name + '</button>' +
        '<button class="admin-team-btn btn-clear" onclick="App.clearResult(\'' + id + '\')">\u2715</button>' +
      '</div></div>';
  },

  setResult(matchId, teamId) {
    Store.setResult(matchId, teamId);
    this._renderAdmin();
  },

  clearResult(matchId) {
    // Also clear downstream results
    Store.setResult(matchId, null);
    if (matchId.startsWith('qf')) {
      // Clear any SF that depended on this QF
      DATA.bracket.semiFinals.forEach(sf => {
        if (sf.from.includes(matchId)) {
          Store.setResult(sf.id, null);
          // Clear final if it depended on this SF
          Store.setResult('final', null);
        }
      });
    }
    if (matchId.startsWith('sf')) {
      Store.setResult('final', null);
    }
    this._renderAdmin();
  },

  resetAll() {
    if (!confirm('Reset everything? This clears all data including your bracket.')) return;
    Store.reset();
    this._hideNav();
    this.navigate('landing');
    document.getElementById('entry-name').value = '';
    document.getElementById('entry-ref').value = '';
    this.toast('All data cleared');
  },

  /* ── Toast ── */
  toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.add('hidden'), 2800);
  },

  /* ── Creator chips on landing ── */
  _renderCreatorChips() {
    const row = document.getElementById('creators-row');
    if (!row) return;
    row.innerHTML = DATA.creators.map(c =>
      '<div class="creator-chip">' +
        '<div class="creator-avatar">' + c.initials + '</div>' +
        '<span>' + esc(c.name) + '</span>' +
      '</div>'
    ).join('');
  },
};

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => App.init());
