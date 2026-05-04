import { Link, NavLink } from 'react-router'
import "../styles/Navbar.css"

export const Nav = () => {
  return <nav className="navbar">
    <div className="nav-content">
      {/* לוגו - לחיצה עליו תמיד תחזיר לדף הבית */}
      <Link to="/" className="logo">
        <span className="logo-icon">🏢</span>
        <span className="logo-text">RoomAlloc</span>
      </Link>

      {/* תפריט הניווט */}
      <div className="nav-links">
        <NavLink to="home" className={({ isActive }) => isActive ? 'link active' : 'link'}>
          Home
        </NavLink>
        <NavLink to="roomList" className={({ isActive }) => isActive ? 'link active' : 'link'}>
          Room List
        </NavLink>

        <NavLink to="addAssignment" className={({ isActive }) => isActive ? 'link active' : 'link'}>
          Add Assignment
        </NavLink>
      </div>
    </div>
  </nav>
}