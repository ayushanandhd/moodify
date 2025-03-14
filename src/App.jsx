import { useState } from 'react'
import './App.css'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Nav />
      <Hero />
    </>
  )
}

export default App
