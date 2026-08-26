import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'

type BackgroundVariant =
  | 'fade-relocate'
  | 'strong-breathing'
  | 'random-drift'
  | 'shape-morph'
  | 'soft-fade-relocate'
  | 'soft-fade-relocate-noise'

type BlobPosition = {
  x: number
  y: number
}

const examplePages: Array<{
  label: string
  path: string
  variant: BackgroundVariant
}> = [
  { label: 'Example 1', path: '/example-1', variant: 'fade-relocate' },
  { label: 'Example 2', path: '/example-2', variant: 'strong-breathing' },
  { label: 'Example 3', path: '/example-3', variant: 'random-drift' },
  { label: 'Example 4', path: '/example-4', variant: 'shape-morph' },
  { label: 'Example 5', path: '/example-5', variant: 'soft-fade-relocate' },
  { label: 'Example 6', path: '/example-6', variant: 'soft-fade-relocate-noise' },
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

function randomPosition(min = 8, max = 92): BlobPosition {
  return {
    x: min + Math.random() * (max - min),
    y: min + Math.random() * (max - min),
  }
}

function choosePosition(
  previous: BlobPosition,
  other: BlobPosition,
  minimumFromPrevious: number,
  minimumFromOther: number,
  min = 8,
  max = 92,
) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const candidate = randomPosition(min, max)

    if (
      distance(candidate, previous) >= minimumFromPrevious &&
      distance(candidate, other) >= minimumFromOther
    ) {
      return candidate
    }
  }

  const fallbackPositions: BlobPosition[] = [
    { x: 14, y: 16 },
    { x: 86, y: 18 },
    { x: 16, y: 84 },
    { x: 84, y: 82 },
    { x: 50, y: 12 },
    { x: 50, y: 88 },
  ]

  return (
    fallbackPositions.find(
      (candidate) =>
        distance(candidate, previous) >= minimumFromPrevious &&
        distance(candidate, other) >= minimumFromOther,
    ) ?? fallbackPositions[0]
  )
}

function FadeRelocateBackground({ className = '' }: { className?: string }) {
  const backgroundRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = backgroundRef.current
    if (!element) return

    const positions: [BlobPosition, BlobPosition] = [
      { x: 72, y: 24 },
      { x: 20, y: 76 },
    ]

    const setPosition = (index: 0 | 1, position: BlobPosition) => {
      element.style.setProperty(index === 0 ? '--a-x' : '--b-x', `${position.x}%`)
      element.style.setProperty(index === 0 ? '--a-y' : '--b-y', `${position.y}%`)
    }

    const relocate = (index: 0 | 1, otherIndex: 0 | 1) => {
      const next = choosePosition(positions[index], positions[otherIndex], 48, 58)
      positions[index] = next
      setPosition(index, next)
    }

    const handleIteration = (event: AnimationEvent) => {
      if (event.animationName === 'fade-relocate-a') {
        relocate(0, 1)
      } else if (event.animationName === 'fade-relocate-b') {
        relocate(1, 0)
      }
    }

    element.addEventListener('animationiteration', handleIteration)
    return () => element.removeEventListener('animationiteration', handleIteration)
  }, [])

  return (
    <div
      ref={backgroundRef}
      className={`example-page animated-background fade-relocate-background ${className}`.trim()}
    />
  )
}

function RandomDriftBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = backgroundRef.current
    if (!element) return

    const positions: [BlobPosition, BlobPosition] = [
      { x: 78, y: 18 },
      { x: 18, y: 82 },
    ]
    const timers: number[] = []

    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(callback, delay)
      timers.push(timer)
    }

    const setPosition = (index: 0 | 1, position: BlobPosition) => {
      element.style.setProperty(index === 0 ? '--a-x' : '--b-x', `${position.x}%`)
      element.style.setProperty(index === 0 ? '--a-y' : '--b-y', `${position.y}%`)
    }

    const move = (index: 0 | 1, duration: number) => {
      const otherIndex = index === 0 ? 1 : 0
      const next = choosePosition(positions[index], positions[otherIndex], 34, 28, 2, 98)
      positions[index] = next
      setPosition(index, next)
      schedule(() => move(index, duration), duration)
    }

    setPosition(0, positions[0])
    setPosition(1, positions[1])
    schedule(() => move(0, 10500), 180)
    schedule(() => move(1, 13800), 900)

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [])

  return <div ref={backgroundRef} className="example-page animated-background random-drift-background" />
}

function ExamplePage({ variant }: { variant: BackgroundVariant }) {
  if (variant === 'fade-relocate') {
    return <FadeRelocateBackground />
  }

  if (variant === 'soft-fade-relocate') {
    return <FadeRelocateBackground className="soft-fade-relocate-background" />
  }

  if (variant === 'soft-fade-relocate-noise') {
    return <FadeRelocateBackground className="soft-fade-relocate-background noise-overlay-background" />
  }

  if (variant === 'random-drift') {
    return <RandomDriftBackground />
  }

  return <div className={`example-page animated-background ${variant}-background`} />
}

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const location = useLocation()
  const currentPageLabel =
    location.pathname === '/'
      ? 'Home'
      : (examplePages.find((page) => page.path === location.pathname)?.label ?? 'Home')

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

      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          top: '30px',
          left: '80px',
          zIndex: 34,
          color: '#f8fafc',
          fontSize: '16px',
          fontWeight: 600,
          lineHeight: 1.25,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {currentPageLabel}
      </div>

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
