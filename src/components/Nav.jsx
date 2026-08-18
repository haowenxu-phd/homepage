import { NavLink } from 'react-router-dom'

export default function Nav() {
  return (
    <nav className="nav">
      <h1 className="brand">Computational Transportation Science · Digital Twins · LLMs & Agentic AI · 3D World Models & Simulation</h1>
      <div className="links">
        <NavLink to="/" end>Home</NavLink>
        
        <NavLink to="/portfolio">Portfolio</NavLink>    
         
        <NavLink to="/teaching">Teaching</NavLink>   
         
        <NavLink to="/learning">Online Learning Tool</NavLink>     

        <NavLink to="/grants">Grants & Collaboration</NavLink>     


         
      </div>
    </nav>
  )
}
