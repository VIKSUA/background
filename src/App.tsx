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

function ExampleOneBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = backgroundRef.current
    if (!element) return

    const positions: BlobPosition[] = [
      { x: 24, y: 24 },
      { x: 80, y: 28 },
      { x: 78, y: 72 },
      { x: 20, y: 70 },
    ]
    const variableNames = ['a', 'b', 'c', 'd'] as const

    const setPosition = (index: number, position: BlobPosition) => {
      const variableName = variableNames[index]
      element.style.setProperty(`--${variableName}-x`, `${position.x}%`)
      element.style.setProperty(`--${variableName}-y`, `${position.y}%`)
    }

    const chooseNextPosition = (index: number) => {
      const previous = positions[index]
      const sameColor = positions[(index + 2) % 4]
      const otherColors = positions.filter(
        (_, positionIndex) => positionIndex !== index && positionIndex !== (index + 2) % 4,
      )
      const toLeft = sameColor.x >= 50
      const toTop = sameColor.y >= 50
      const xMin = toLeft ? 6 : 52
      const xMax = toLeft ? 48 : 94
      const yMin = toTop ? 6 : 52
      const yMax = toTop ? 48 : 94

      const isUsable = (candidate: BlobPosition) =>
        distance(candidate, previous) >= 16 &&
        distance(candidate, sameColor) >= 52 &&
        otherColors.every((other) => distance(candidate, other) >= 36)

      for (let attempt = 0; attempt < 80; attempt += 1) {
        const candidate = {
          x: xMin + Math.random() * (xMax - xMin),
          y: yMin + Math.random() * (yMax - yMin),
        }

        if (isUsable(candidate)) {
          return candidate
        }
      }

      const fallbacks: BlobPosition[] = [
        { x: toLeft ? 14 : 86, y: toTop ? 14 : 86 },
        { x: toLeft ? 14 : 86, y: toTop ? 34 : 66 },
        { x: toLeft ? 34 : 66, y: toTop ? 14 : 86 },
        { x: toLeft ? 22 : 78, y: toTop ? 22 : 78 },
      ]

      return fallbacks.reduce((best, candidate) => {
        const score = Math.min(
          distance(candidate, sameColor),
          ...otherColors.map((other) => distance(candidate, other)),
        )
        const bestScore = Math.min(
          distance(best, sameColor),
          ...otherColors.map((other) => distance(best, other)),
        )
        return score > bestScore ? candidate : best
      })
    }

    const relocate = (index: number) => {
      const next = chooseNextPosition(index)
      positions[index] = next
      setPosition(index, next)
    }

    const handleIteration = (event: AnimationEvent) => {
      if (event.animationName === 'example-one-a') {
        relocate(0)
      } else if (event.animationName === 'example-one-b') {
        relocate(1)
      } else if (event.animationName === 'example-one-c') {
        relocate(2)
      } else if (event.animationName === 'example-one-d') {
        relocate(3)
      }
    }

    element.addEventListener('animationiteration', handleIteration)
    return () => element.removeEventListener('animationiteration', handleIteration)
  }, [])

  return (
    <div
      ref={backgroundRef}
      className="example-page animated-background example-one-four-spots texture-overlay-background"
    />
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

function SoftFadeRelocateBackground() {
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
      if (event.animationName === 'soft-fade-relocate-a') {
        relocate(0, 1)
      } else if (event.animationName === 'soft-fade-relocate-b') {
        relocate(1, 0)
      }
    }

    element.addEventListener('animationiteration', handleIteration)
    return () => element.removeEventListener('animationiteration', handleIteration)
  }, [])

  return (
    <div
      ref={backgroundRef}
      className="example-page animated-background fade-relocate-background soft-fade-relocate-background"
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
    return <ExampleOneBackground />
  }

  if (variant === 'soft-fade-relocate') {
    return <SoftFadeRelocateBackground />
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
