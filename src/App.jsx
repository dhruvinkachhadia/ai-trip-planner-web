import { useState } from 'react'
import './App.css'
import { Button } from './components/ui/button'
import HeroComponent from './components/ui/custom/HeroComponent'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
       {/* Hero */}
       <HeroComponent/>
    </>
  )
}

export default App
