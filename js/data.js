/* ═══════════════════════════════════════════════
   The Prophet's Bracket — Data & Configuration
   UCL 2025/26 Knockout Stage
   ═══════════════════════════════════════════════ */

const _CREST = 'https://crests.football-data.org/';

const DATA = {

  teams: {
    'real-madrid':  { name: 'Real Madrid',         short: 'RMA', country: 'Spain',   color: '#FEBE10', logo: _CREST+'86.png'  },
    'man-city':     { name: 'Manchester City',      short: 'MCI', country: 'England', color: '#6CABDD', logo: _CREST+'65.png'  },
    'barcelona':    { name: 'FC Barcelona',         short: 'BAR', country: 'Spain',   color: '#A50044', logo: _CREST+'81.png'  },
    'psg':          { name: 'Paris Saint-Germain',  short: 'PSG', country: 'France',  color: '#004170', logo: _CREST+'524.png' },
    'arsenal':      { name: 'Arsenal',              short: 'ARS', country: 'England', color: '#EF0107', logo: _CREST+'57.png'  },
    'bayern':       { name: 'Bayern Munich',        short: 'BAY', country: 'Germany', color: '#DC052D', logo: _CREST+'5.png'   },
    'liverpool':    { name: 'Liverpool',            short: 'LIV', country: 'England', color: '#C8102E', logo: _CREST+'64.png'  },
    'inter':        { name: 'Inter Milan',          short: 'INT', country: 'Italy',   color: '#010E80', logo: _CREST+'108.png' },
  },

  // Preload logos as Image objects for canvas drawing
  _logoCache: {},
  preloadLogos() {
    const teams = Object.entries(this.teams);
    return Promise.all(teams.map(([id, t]) => new Promise(resolve => {
      if (this._logoCache[id]) return resolve();
      const img = new Image();
      img.onload = () => { this._logoCache[id] = img; resolve(); };
      img.onerror = resolve;
      img.src = t.logo;
    })));
  },
  getLogo(id) { return this._logoCache[id] || null; },

  // Bracket structure — QF pairings feed into SF, then Final
  bracket: {
    quarterFinals: [
      { id: 'qf1', home: 'real-madrid', away: 'man-city'  },
      { id: 'qf2', home: 'barcelona',   away: 'psg'       },
      { id: 'qf3', home: 'arsenal',     away: 'bayern'    },
      { id: 'qf4', home: 'liverpool',   away: 'inter'     },
    ],
    semiFinals: [
      { id: 'sf1', from: ['qf1', 'qf2'] },   // QF1 winner vs QF2 winner
      { id: 'sf2', from: ['qf3', 'qf4'] },   // QF3 winner vs QF4 winner
    ],
    final: { id: 'final', from: ['sf1', 'sf2'] }
  },

  // Points per correct pick — later rounds are worth more
  scoring: {
    qf: 2,      // 2 pts each  (max 8)
    sf: 4,      // 4 pts each  (max 8)
    final: 6    // 6 pts       (max 6)
    // Total possible: 22
  },

  creators: [
    { code: 'GARY10',  name: 'Gary Neville',    initials: 'GN' },
    { code: 'CARRA7',  name: 'Jamie Carragher', initials: 'JC' },
    { code: 'HENRY14', name: 'Thierry Henry',   initials: 'TH' },
    { code: 'RIO5',    name: 'Rio Ferdinand',   initials: 'RF' },
    { code: 'DRURY1',  name: 'Peter Drury',     initials: 'PD' },
  ],

  // Seeded random for deterministic mock data
  _seed: 42,
  _rand() {
    this._seed = (this._seed * 16807 + 0) % 2147483647;
    return this._seed / 2147483647;
  },

  generateMockEntries() {
    this._seed = 42; // reset seed for consistency

    const names = [
      'Alex M.','Jordan K.','Sam T.','Charlie R.','Morgan W.','Casey B.','Riley P.',
      'Quinn D.','Avery L.','Jamie S.','Taylor H.','Drew C.','Reese N.','Hayden F.',
      'Blake J.','Parker V.','Skyler A.','Cameron G.','Finley O.','Rowan E.',
      'Kai Z.','Ellis U.','Dylan I.','Frankie Q.','Emery X.','Sage Y.','Phoenix W.',
      'River B.','Dakota M.','Harley T.','Lennox R.','Arden S.','Marlowe K.',
      'Jules P.','Shiloh D.','Remy L.','Tatum H.','Oakley C.','Sterling N.','Zion F.',
      'Cruz J.','Milan V.','Nico A.','Leo G.','Marco O.','Luca E.','Mateo Z.',
      'Hugo U.','Oscar I.','Felix Q.','Ada W.','Noor K.','Soren T.','Elias R.',
      'Mika B.','Yara P.','Idris D.','Ezra L.','Nova S.','Orion H.','Cleo C.',
      'Jude N.','Zara F.','Kian J.','Iris V.','Bodhi A.','Freya G.','Axel O.',
      'Wren E.','Thea Z.','Silas U.','Luna I.','Atlas Q.','Ivy X.','Beau Y.',
      'Demi W.','Raven B.','Cole M.','Alma T.','Nash R.','Vera S.','Dean K.',
      'Greta P.','Rex D.','Faye L.','Troy H.','Nell C.','Bram N.','Dara F.',
      'Seth J.','Lola V.','Gage A.','Mina G.','Rhys O.','Tess E.','Kent Z.',
      'Opal U.','Jace I.','Skye Q.','Dane X.','Ruth Y.'
    ];

    const entries = [];
    for (let i = 0; i < 150; i++) {
      const creator = this.creators[Math.floor(this._rand() * this.creators.length)];
      const name = names[i % names.length] + (i >= names.length ? ' ' + Math.floor(i / names.length + 1) : '');

      // Generate valid bracket picks
      const picks = {};
      this.bracket.quarterFinals.forEach(m => {
        picks[m.id] = this._rand() > 0.5 ? m.home : m.away;
      });
      this.bracket.semiFinals.forEach(m => {
        const opts = m.from.map(id => picks[id]);
        picks[m.id] = opts[Math.floor(this._rand() * opts.length)];
      });
      const fOpts = this.bracket.semiFinals.map(sf => picks[sf.id]);
      picks.final = fOpts[Math.floor(this._rand() * fOpts.length)];

      entries.push({
        id: 'mock-' + i,
        name: name,
        creatorCode: creator.code,
        picks: picks,
      });
    }
    return entries;
  }
};
