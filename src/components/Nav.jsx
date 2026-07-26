import { NavLink } from 'react-router-dom'

export default function Nav() {
  return (
    <nav className="nav">
      <h1 className="brand">Digital Twins · Intelligent Transportation System · LLMs & Agentic AI · 3D Simulation</h1>
      <div className="links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/portfolio">Portfolio</NavLink>    
        <NavLink to="/teaching">Teaching</NavLink>     
      </div>
    </nav>
  )
}
