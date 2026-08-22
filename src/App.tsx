import { Route, Routes } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="home-background" />} />
      <Route path="*" element={null} />
    </Routes>
  )
}

export default App
