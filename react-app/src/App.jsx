import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import './App.css'

// Champions League matches data with real logos
const matches = [
  { id: 1, home: { name: "Paris", abbr: "PSG", logo: "https://media.api-sports.io/football/teams/85.png" }, away: { name: "Newcastle", abbr: "NEW", logo: "https://media.api-sports.io/football/teams/34.png" } },
  { id: 2, home: { name: "Man City", abbr: "MCI", logo: "https://media.api-sports.io/football/teams/50.png" }, away: { name: "Galatasaray", abbr: "GAL", logo: "https://media.api-sports.io/football/teams/645.png" } },
  { id: 3, home: { name: "Liverpool", abbr: "LIV", logo: "https://media.api-sports.io/football/teams/40.png" }, away: { name: "Qarabağ", abbr: "QAR", logo: "https://media.api-sports.io/football/teams/556.png" } },
  { id: 4, home: { name: "B. Dortmund", abbr: "BVB", logo: "https://media.api-sports.io/football/teams/165.png" }, away: { name: "Inter", abbr: "INT", logo: "https://media.api-sports.io/football/teams/505.png" } },
  { id: 5, home: { name: "Barcelona", abbr: "BAR", logo: "https://media.api-sports.io/football/teams/529.png" }, away: { name: "Copenhagen", abbr: "COP", logo: "https://media.api-sports.io/football/teams/400.png" } },
  { id: 6, home: { name: "Arsenal", abbr: "ARS", logo: "https://media.api-sports.io/football/teams/42.png" }, away: { name: "Kairat Almaty", abbr: "KAA", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FCKairat_logo.png/200px-FCKairat_logo.png" } },
  { id: 7, home: { name: "Leverkusen", abbr: "LEV", logo: "https://media.api-sports.io/football/teams/168.png" }, away: { name: "Villarreal", abbr: "VIL", logo: "https://media.api-sports.io/football/teams/533.png" } },
  { id: 8, home: { name: "Atletico Madrid", abbr: "ATM", logo: "https://media.api-sports.io/football/teams/530.png" }, away: { name: "Bodø/Glimt", abbr: "BOD", logo: "https://media.api-sports.io/football/teams/327.png" } },
  { id: 9, home: { name: "Benfica", abbr: "BEN", logo: "https://media.api-sports.io/football/teams/211.png" }, away: { name: "Real Madrid", abbr: "RMA", logo: "https://media.api-sports.io/football/teams/541.png" } },
  { id: 10, home: { name: "Frankfurt", abbr: "FRA", logo: "https://media.api-sports.io/football/teams/169.png" }, away: { name: "Tottenham", abbr: "TOT", logo: "https://media.api-sports.io/football/teams/47.png" } },
  { id: 11, home: { name: "Club Brugge", abbr: "BRU", logo: "https://media.api-sports.io/football/teams/569.png" }, away: { name: "Marseille", abbr: "MAR", logo: "https://media.api-sports.io/football/teams/81.png" } },
  { id: 12, home: { name: "PSV", abbr: "PSV", logo: "https://media.api-sports.io/football/teams/197.png" }, away: { name: "Bayern München", abbr: "BAY", logo: "https://media.api-sports.io/football/teams/157.png" } },
  { id: 13, home: { name: "Ajax", abbr: "AJX", logo: "https://champion-selector--yevhenleibov.replit.app/assets/image_1768916586346-S6cOJpce.png" }, away: { name: "Olympiacos", abbr: "OLY", logo: "https://media.api-sports.io/football/teams/553.png" } },
  { id: 14, home: { name: "Napoli", abbr: "NAP", logo: "https://champion-selector--yevhenleibov.replit.app/assets/image_1768916677440-h7V20gHz.png" }, away: { name: "Chelsea", abbr: "CHE", logo: "https://media.api-sports.io/football/teams/49.png" } },
  { id: 15, home: { name: "Monaco", abbr: "MON", logo: "https://media.api-sports.io/football/teams/91.png" }, away: { name: "Juventus", abbr: "JUV", logo: "https://media.api-sports.io/football/teams/496.png" } },
  { id: 16, home: { name: "Union SG", abbr: "USG", logo: "https://champion-selector--yevhenleibov.replit.app/assets/image_1768916766302-CDgxxO57.png" }, away: { name: "Atalanta", abbr: "ATA", logo: "https://media.api-sports.io/football/teams/499.png" } },
  { id: 17, home: { name: "Athletic Bilbao", abbr: "ATH", logo: "https://media.api-sports.io/football/teams/531.png" }, away: { name: "Sporting CP", abbr: "SCP", logo: "https://media.api-sports.io/football/teams/228.png" } },
  { id: 18, home: { name: "Porto", abbr: "POR", logo: "https://media.api-sports.io/football/teams/212.png" }, away: { name: "Slavia Praha", abbr: "SLA", logo: "https://tmssl.akamaized.net/images/wappen/head/62.png" } },
]

function AppWithPrivy() {
  const { login, authenticated } = usePrivy()

  // Redirect to limitless.exchange after successful login
  useEffect(() => {
    if (authenticated) {
      window.location.href = 'https://limitless.exchange/pro/cat/football-matches'
    }
  }, [authenticated])

  return <AppContent onLogin={login} />
}

function AppWithoutPrivy() {
  const handleLogin = () => {
    alert('Privy App ID not configured. Please set your App ID in main.jsx')
  }
  return <AppContent onLogin={handleLogin} />
}

function App({ privyEnabled = true }) {
  if (privyEnabled) {
    return <AppWithPrivy />
  }
  return <AppWithoutPrivy />
}

function AppContent({ onLogin }) {
  const [predictions, setPredictions] = useState({})

  // Load saved predictions on mount
  useEffect(() => {
    const saved = localStorage.getItem('championsLeaguePredictions')
    if (saved) {
      setPredictions(JSON.parse(saved))
    }
  }, [])

  // Save predictions to localStorage
  const savePredictions = (newPredictions) => {
    localStorage.setItem('championsLeaguePredictions', JSON.stringify(newPredictions))
  }

  const selectPrediction = (matchId, selection) => {
    const newPredictions = { ...predictions, [matchId]: selection }
    setPredictions(newPredictions)
    savePredictions(newPredictions)
  }

  const scrollToPredictions = () => {
    document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = () => {
    onLogin()
  }

  const predictionsCount = Object.keys(predictions).length
  const totalMatches = matches.length
  const isComplete = predictionsCount === totalMatches
  const progressPercent = (predictionsCount / totalMatches) * 100

  // Group matches into rows of 2
  const matchRows = []
  for (let i = 0; i < matches.length; i += 2) {
    matchRows.push(matches.slice(i, i + 2))
  }

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>Pick the winners<br />Get $1,000</h1>
          <p className="subtitle">Prove you know football better!</p>
          <button className="start-btn" onClick={scrollToPredictions}>Start predicting</button>
        </div>
        <div className="info-card">
          <h3>5 best predictors get $1,000 each.</h3>
          <p className="label">To join:</p>
          <ul>
            <li>
              <span className="check-circle">✓</span>
              Predict all match outcomes
            </li>
            <li>
              <span className="check-circle">✓</span>
              Create Limitless account
            </li>
            <li>
              <span className="check-circle">✓</span>
              Make 1 trade, $5 minimum
            </li>
          </ul>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="sticky-header">
          <h2 className="section-title">Make your predictions</h2>

          <div className="progress-container">
            <div className="progress-bar-wrapper">
              <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p className="progress-text">
              <span>{predictionsCount}</span> of <span>{totalMatches}</span> predictions made ·
              <span>{isComplete ? ' Completed' : ' Incomplete'}</span>
            </p>
          </div>
        </div>

        {isComplete && (
          <div className="top-submit-container">
            <button className="top-submit-btn" onClick={handleSubmit}>
              Sign up to proceed with rewards
              <span>→</span>
            </button>
          </div>
        )}

        <div className="matches-container">
          {matchRows.map((row, rowIndex) => (
            <div className="match-row" key={rowIndex}>
              {row.map((match) => (
                <div className="match-card" key={match.id}>
                  <button
                    className={`team-btn ${predictions[match.id] === 'home' ? 'selected' : ''}`}
                    onClick={() => selectPrediction(match.id, 'home')}
                  >
                    <img className="team-logo" src={match.home.logo} alt={match.home.name} />
                    <span className="team-name">{match.home.name}</span>
                  </button>
                  <button
                    className={`draw-btn ${predictions[match.id] === 'draw' ? 'selected' : ''}`}
                    onClick={() => selectPrediction(match.id, 'draw')}
                  >
                    Draw
                  </button>
                  <button
                    className={`team-btn ${predictions[match.id] === 'away' ? 'selected' : ''}`}
                    onClick={() => selectPrediction(match.id, 'away')}
                  >
                    <img className="team-logo" src={match.away.logo} alt={match.away.name} />
                    <span className="team-name">{match.away.name}</span>
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="footer-section">
          <p className="footer-message">
            {isComplete ? 'All predictions made! Ready to sign up.' : `Select outcomes for all ${totalMatches} matches to continue`}
          </p>
          {isComplete && (
            <button className="submit-btn" onClick={handleSubmit}>
              Sign up to proceed with rewards
              <span>→</span>
            </button>
          )}
          <p className="powered-by">Powered by <a href="#">Limitless Exchange</a></p>
        </div>
      </main>
    </>
  )
}

export default App
