import { Link, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

const examplePages = [
  { label: 'Example 1', path: '/example-1' },
  { label: 'Example 2', path: '/example-2' },
  { label: 'Example 3', path: '/example-3' },
]

function HomePage() {
  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Background</p>
        <h1>Home</h1>
        <nav className="link-stack" aria-label="Example pages">
          {examplePages.map((page) => (
            <Link key={page.path} className="nav-link" to={page.path}>
              {page.label}
            </Link>
          ))}
        </nav>
      </section>
    </main>
  )
}

function ExamplePage({ label }: { label: string }) {
  return (
    <main className="page">
      <section className="card">
        <Link className="home-link" to="/">
          Home
        </Link>
        <h1>{label}</h1>
        <p className="subtle">This page is intentionally empty for now.</p>
      </section>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/example-1" element={<ExamplePage label="Example 1" />} />
      <Route path="/example-2" element={<ExamplePage label="Example 2" />} />
      <Route path="/example-3" element={<ExamplePage label="Example 3" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
