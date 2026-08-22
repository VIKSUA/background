import { useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'

const examplePages = [
  { label: 'Example 1', path: '/example-1', background: 'bg-example-1' },
  { label: 'Example 2', path: '/example-2', background: 'bg-example-2' },
  { label: 'Example 3', path: '/example-3', background: 'bg-example-3' },
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

function Shell({ pathname }: { pathname: string }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const match = examplePages.find((page) => page.path === pathname)
  const backgroundClass = match?.background ?? 'bg-home'

  return (
    <div className={`app-shell ${backgroundClass}`}>
      <button
        type="button"
        className="menu-button"
        aria-label={isDrawerOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isDrawerOpen}
        aria-controls="example-drawer"
        onClick={() => setIsDrawerOpen((current) => !current)}
      >
        <MenuIcon />
      </button>

      <aside
        id="example-drawer"
        className={`drawer ${isDrawerOpen ? 'drawer-open' : ''}`}
        aria-hidden={!isDrawerOpen}
      >
        <nav className="drawer-nav" aria-label="Examples">
          {examplePages.map((page) => (
            <Link
              key={page.path}
              className="drawer-link"
              to={page.path}
              onClick={() => setIsDrawerOpen(false)}
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
        onClick={() => setIsDrawerOpen(false)}
      />
    </div>
  )
}

function App() {
  const location = useLocation()
  const shellKey = location.pathname

  return (
    <Routes>
      <Route path="/" element={<Shell key={shellKey} pathname={location.pathname} />} />
      <Route
        path="/example-1"
        element={<Shell key={shellKey} pathname={location.pathname} />}
      />
      <Route
        path="/example-2"
        element={<Shell key={shellKey} pathname={location.pathname} />}
      />
      <Route
        path="/example-3"
        element={<Shell key={shellKey} pathname={location.pathname} />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
