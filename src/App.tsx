import { useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

const examplePages = [
  { label: 'Example 1', path: '/example-1', className: 'example-page--1' },
  { label: 'Example 2', path: '/example-2', className: 'example-page--2' },
  { label: 'Example 3', path: '/example-3', className: 'example-page--3' },
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

function ExamplePage({ className }: { className: string }) {
  return <div className={`example-page ${className}`} />
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
            element={<ExamplePage className={page.className} />}
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
