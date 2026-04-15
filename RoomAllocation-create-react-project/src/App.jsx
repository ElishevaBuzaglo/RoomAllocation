import { useState } from 'react'
import RoomsList from './RoomsList.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>פרויקט משותף בגיט</h1>
      <h2>שיבוץ חדרים</h2>
      <RoomsList></RoomsList>
    </>
  )
}

export default App
