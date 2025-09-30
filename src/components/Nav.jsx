import { NavLink } from 'react-router-dom'

export default function Nav() {
  return (
    <nav className="nav">
      <h1 className="brand">Researcher · Digital Twins · LLMs · Agentic AI</h1>
      <div className="links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </div>
    </nav>
  )
}
