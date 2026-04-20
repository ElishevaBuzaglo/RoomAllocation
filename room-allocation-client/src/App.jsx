import { useState } from 'react'
import { BrowserRouter } from "react-router"
import './styles/App.css' 
import { Nav } from './routing/Nav.jsx'
import { Routing } from './routing/Routing.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
            <Nav></Nav>
            <Routing></Routing>
        </BrowserRouter>
    </>
  )
}

export default App
