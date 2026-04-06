/* ═══════════════════════════════════════════════
   The Prophet's Bracket — Leaderboard UI
   ═══════════════════════════════════════════════ */

const LeaderboardUI = {
  tab: 'individual',

  render(container) {
    if (this.tab === 'individual') this.renderIndividual(container);
    else this.renderCohort(container);
  },

  switchTab(tab) {
    this.tab = tab;
    document.querySelectorAll('.lb-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.tab === tab)
    );
    this.render(document.getElementById('leaderboard-container'));
  },

  /* ── Individual leaderboard ── */
  renderIndividual(container) {
    const entries = Store.getLeaderboard();
    const user = Store.getUser();
    const results = Store.getResults();
    const hasResults = Object.values(results).some(Boolean);

    if (!entries.length) {
      container.innerHTML = '<div class="lb-empty">No entries yet. Be the first!</div>';
      return;
    }

    let h = '<div class="lb-list">';
    const top = entries.slice(0, 50);

    top.forEach(e => {
      const me = e.isCurrentUser;
      const t3 = e.rank <= 3;
      const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];

      h += '<div class="lb-entry' + (me ? ' current-user' : '') + (t3 ? ' top-3' : '') + '">';
      h += '<div class="lb-rank">' + (t3 ? medals[e.rank - 1] : e.rank) + '</div>';
      h += '<div class="lb-name">' + esc(e.name) + (me ? ' (You)' : '');
      if (e.creatorCode) h += '<span class="lb-creator-tag">' + esc(e.creatorCode) + '</span>';
      h += '</div>';
      h += '<div class="lb-score">';
      h += '<div class="lb-score-value">' + e.score + '</div>';
      h += '<div class="lb-score-label">' + (hasResults ? e.correct + '/' + e.total + ' correct' : 'awaiting results') + '</div>';
      h += '</div></div>';
    });

    h += '</div>';

    // Show user's position if outside top 50
    if (user && user.locked) {
      const me = entries.find(e => e.isCurrentUser);
      if (me && me.rank > 50) {
        h += '<div class="lb-user-pos">';
        h += '<div class="lb-entry current-user">';
        h += '<div class="lb-rank">' + me.rank + '</div>';
        h += '<div class="lb-name">' + esc(me.name) + ' (You)</div>';
        h += '<div class="lb-score"><div class="lb-score-value">' + me.score + '</div>';
        h += '<div class="lb-score-label">' + me.correct + '/' + me.total + ' correct</div></div></div></div>';
      }
    }

    container.innerHTML = h;
  },

  /* ── Creator cohort leaderboard ── */
  renderCohort(container) {
    const cohorts = Store.getCreatorLeaderboard();
    const results = Store.getResults();
    const hasResults = Object.values(results).some(Boolean);

    let h = '<div class="cohort-list">';

    cohorts.forEach(c => {
      h += '<div class="cohort-card">';
      h += '<div class="cohort-rank">' + c.rank + '</div>';
      h += '<div class="creator-avatar">' + c.initials + '</div>';
      h += '<div class="cohort-info">';
      h += '<div class="cohort-name">' + esc(c.name) + '</div>';
      h += '<div class="cohort-code">' + c.code + '</div>';
      h += '</div>';
      h += '<div class="cohort-stats">';
      h += '<div class="cohort-avg">' + (hasResults ? c.avgScore + ' avg' : '--') + '</div>';
      h += '<div class="cohort-followers">' + c.followers + ' followers</div>';
      h += '</div></div>';
    });

    h += '</div>';
    container.innerHTML = h;
  },
};

/* Simple HTML escape */
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
