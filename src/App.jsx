import { Routes, Route } from 'react-router-dom'
import Home from './pages/home/Home.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Nav from './components/Nav.jsx'

import BushfireViewer from './pages/projects/bushfire_voxel/Bushfire_Voxel3.jsx'
import DataVisGSL from './pages/projects/datavis_gsl/dataVisGSL.jsx';
import Projects from "./pages/portfolio/Portfolio.jsx";

export default function App() {
  return (
    <div className="app">
      <Nav />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/fire_sim_app" element={<BushfireViewer />} />
          <Route path="/xai_dash" element={<DataVisGSL />} />
          <Route path="/portfolio" element={<Projects />} />
          
          
        </Routes>
      </div>
    </div>
  )
}
