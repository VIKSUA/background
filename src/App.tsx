import { useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

type BackgroundVariant = 'breathing' | 'fade-relocate' | 'slow-drift' | 'drift-breathing'

type BlobPosition = {
  x: number
  y: number
}

const examplePages: Array<{
  label: string
  path: string
  variant: BackgroundVariant
}> = [
  { label: 'Example 1', path: '/example-1', variant: 'breathing' },
  { label: 'Example 2', path: '/example-2', variant: 'fade-relocate' },
  { label: 'Example 3', path: '/example-3', variant: 'slow-drift' },
  { label: 'Example 4', path: '/example-4', variant: 'drift-breathing' },
]

const initialBlobPositions: [BlobPosition, BlobPosition] = [
  { x: 70, y: 22 },
  { x: 22, y: 72 },
]

function MenuIcon() {
  return (
    <span className="menu-icon" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}

function distance(a: BlobPosition, b: BlobPosition) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function randomPosition(): BlobPosition {
  return {
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
  }
}

function chooseRelocation(previous: BlobPosition, other: BlobPosition) {
  const minimumFromPrevious = 28
  const minimumFromOther = 36

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const candidate = randomPosition()

    if (
      distance(candidate, previous) >= minimumFromPrevious &&
      distance(candidate, other) >= minimumFromOther
    ) {
      return candidate
    }
  }

  const fallbackPositions: BlobPosition[] = [
    { x: 18, y: 20 },
    { x: 82, y: 20 },
    { x: 18, y: 80 },
    { x: 82, y: 80 },
    { x: 50, y: 18 },
    { x: 50, y: 82 },
  ]

  return (
    fallbackPositions.find(
      (candidate) =>
        distance(candidate, previous) >= minimumFromPrevious &&
        distance(candidate, other) >= minimumFromOther,
    ) ?? fallbackPositions[0]
  )
}

function BlobPair({ className }: { className: string }) {
  return (
    <div className={`example-page animated-background ${className}`}>
      <div className="gradient-blob gradient-blob--a" />
      <div className="gradient-blob gradient-blob--b" />
    </div>
  )
}

function FadeRelocateBackground() {
  const [positions, setPositions] = useState<[BlobPosition, BlobPosition]>(
    initialBlobPositions,
  )

  const relocate = (index: 0 | 1) => {
    setPositions((current) => {
      const otherIndex = index === 0 ? 1 : 0
      const next = chooseRelocation(current[index], current[otherIndex])
      const updated: [BlobPosition, BlobPosition] = [current[0], current[1]]
      updated[index] = next
      return updated
    })
  }

  return (
    <div className="example-page animated-background fade-relocate-background">
      <div
        className="gradient-blob gradient-blob--a"
        style={{ left: `${positions[0].x}%`, top: `${positions[0].y}%` }}
        onAnimationIteration={() => relocate(0)}
      />
      <div
        className="gradient-blob gradient-blob--b"
        style={{ left: `${positions[1].x}%`, top: `${positions[1].y}%` }}
        onAnimationIteration={() => relocate(1)}
      />
    </div>
  )
}

function ExamplePage({ variant }: { variant: BackgroundVariant }) {
  if (variant === 'fade-relocate') {
    return <FadeRelocateBackground />
  }

  return <BlobPair className={`${variant}-background`} />
}

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const closeDrawer = () => setIsDrawerOpen(false)

  return (
    <div className="app-shell">
      <button
        type="button"
        className="menu-button"
        aria-label={isDrawerOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isDrawerOpen}
        aria-controls="navigation-drawer"
        onClick={() => setIsDrawerOpen((current) => !current)}
      >
        <MenuIcon />
      </button>

      <aside
        id="navigation-drawer"
        className={`drawer ${isDrawerOpen ? 'drawer-open' : ''}`}
        aria-hidden={!isDrawerOpen}
      >
        <Link className="drawer-link drawer-home" to="/" onClick={closeDrawer}>
          Home
        </Link>

        <nav className="drawer-routes" aria-label="Example pages">
          {examplePages.map((page) => (
            <Link
              key={page.path}
              className="drawer-link"
              to={page.path}
              onClick={closeDrawer}
            >
              {page.label}
            </Link>
          ))}
        </nav>
      </aside>

      <button
        type="button"
        className={`drawer-backdrop ${isDrawerOpen ? 'visible' : ''}`}
        aria-label="Close menu"
        tabIndex={-1}
        onClick={closeDrawer}
      />

      <Routes>
        <Route path="/" element={<div className="home-background" />} />
        {examplePages.map((page) => (
          <Route
            key={page.path}
            path={page.path}
            element={<ExamplePage variant={page.variant} />}
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
