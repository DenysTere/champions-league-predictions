/* ═══════════════════════════════════════════════
   The Prophet's Bracket — State Management
   localStorage-based. Swap for Firebase/Supabase in production.
   ═══════════════════════════════════════════════ */

const Store = (() => {
  const PFX = 'pb_';

  function get(k) {
    try { return JSON.parse(localStorage.getItem(PFX + k)); }
    catch { return null; }
  }
  function set(k, v) { localStorage.setItem(PFX + k, JSON.stringify(v)); }
  function del(k) { localStorage.removeItem(PFX + k); }

  return {

    /* ── User ── */
    getUser()  { return get('user'); },
    saveUser(u){ set('user', u); },

    createUser(displayName, referralCode) {
      const u = {
        id: 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        displayName,
        referralCode: referralCode || null,
        picks: {},
        locked: false,
        lockedAt: null,
        createdAt: new Date().toISOString(),
      };
      set('user', u);
      return u;
    },

    /* ── Picks ── */
    savePick(matchId, teamId) {
      const u = this.getUser();
      if (!u || u.locked) return null;
      u.picks[matchId] = teamId;
      clearDownstream(matchId, u.picks);
      this.saveUser(u);
      return u;
    },

    lockBracket() {
      const u = this.getUser();
      if (!u) return null;
      u.locked = true;
      u.lockedAt = new Date().toISOString();
      this.saveUser(u);
      return u;
    },

    /* ── Results (admin / demo) ── */
    getResults()  { return get('results') || {}; },

    setResult(matchId, teamId) {
      const r = this.getResults();
      if (teamId === null) { delete r[matchId]; }
      else { r[matchId] = teamId; }
      set('results', r);
      return r;
    },

    clearResults() { del('results'); },

    /* ── Scoring ── */
    calcScore(picks) {
      const r = this.getResults();
      let score = 0, correct = 0, total = 0;

      DATA.bracket.quarterFinals.forEach(m => {
        if (r[m.id]) { total++; if (picks[m.id] === r[m.id]) { score += DATA.scoring.qf; correct++; } }
      });
      DATA.bracket.semiFinals.forEach(m => {
        if (r[m.id]) { total++; if (picks[m.id] === r[m.id]) { score += DATA.scoring.sf; correct++; } }
      });
      if (r.final) { total++; if (picks.final === r.final) { score += DATA.scoring.final; correct++; } }

      return { score, correct, total, max: 22 };
    },

    /* ── Leaderboard ── */
    getMockEntries() {
      let e = get('mock_entries');
      if (!e) { e = DATA.generateMockEntries(); set('mock_entries', e); }
      return e;
    },

    getLeaderboard() {
      const entries = this.getMockEntries();
      const user = this.getUser();

      const scored = entries.map(e => ({
        ...e, ...this.calcScore(e.picks),
      }));

      // Inject current user if bracket is locked
      if (user && user.locked) {
        scored.push({
          id: user.id,
          name: user.displayName,
          creatorCode: user.referralCode,
          picks: user.picks,
          ...this.calcScore(user.picks),
          isCurrentUser: true,
        });
      }

      scored.sort((a, b) => b.score - a.score || b.correct - a.correct);
      scored.forEach((e, i) => { e.rank = i + 1; });
      return scored;
    },

    getCreatorLeaderboard() {
      const all = this.getLeaderboard();
      const cohorts = {};

      DATA.creators.forEach(c => {
        cohorts[c.code] = { ...c, followers: 0, totalScore: 0, avgScore: 0, bestScore: 0 };
      });

      all.forEach(e => {
        if (e.creatorCode && cohorts[e.creatorCode]) {
          const c = cohorts[e.creatorCode];
          c.followers++;
          c.totalScore += e.score;
          c.bestScore = Math.max(c.bestScore, e.score);
        }
      });

      const list = Object.values(cohorts).map(c => {
        c.avgScore = c.followers > 0 ? +(c.totalScore / c.followers).toFixed(1) : 0;
        return c;
      });

      list.sort((a, b) => b.avgScore - a.avgScore || b.followers - a.followers);
      list.forEach((c, i) => { c.rank = i + 1; });
      return list;
    },

    /* ── Reset ── */
    reset() {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PFX))
        .forEach(k => localStorage.removeItem(k));
    },
  };

  /* ── Private helpers ── */
  function clearDownstream(matchId, picks) {
    if (matchId.startsWith('qf')) {
      DATA.bracket.semiFinals.forEach(sf => {
        if (sf.from.includes(matchId)) {
          const valid = sf.from.map(id => picks[id]).filter(Boolean);
          if (picks[sf.id] && !valid.includes(picks[sf.id])) {
            delete picks[sf.id];
            clearDownstream(sf.id, picks);
          }
        }
      });
    }
    if (matchId.startsWith('sf')) {
      const f = DATA.bracket.final;
      if (f.from.includes(matchId)) {
        const valid = f.from.map(id => picks[id]).filter(Boolean);
        if (picks.final && !valid.includes(picks.final)) {
          delete picks.final;
        }
      }
    }
  }
})();
