import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Home from './pages/home/Home.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Nav from './components/Nav.jsx'

import BushfireViewer from './pages/projects/bushfire_voxel/Bushfire_Voxel3.jsx'
import ProjectDetail, { VoxelFireDetail } from './pages/projects/bushfire_voxel/Bushfire_Voxel_landing.jsx'

import DataVisGSL from './pages/projects/datavis_gsl/dataVisGSL.jsx';
import Projects from "./pages/portfolio/Portfolio.jsx";

import ProjectDetail2, { RecoilDetail } from "./pages/projects/recoil/recoil_agentai_landing.jsx"
import ProjectDetail3, { RtmcsDetail } from "./pages/projects/rtmcs/rtmcs_landing.jsx"  

import ProjectDetail4, { CtwinDetail } from "./pages/projects/ctwin/ctwin_agentai_landing.jsx"  

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

          <Route path="/portfolio/bushfire_sim" element={<VoxelFireDetail />} />
          <Route path="/portfolio/agentic_ai_dt" element={<RecoilDetail />} />
          <Route path="/portfolio/mobile_app_smart_speed" element={<RtmcsDetail />} />
          <Route path="/portfolio/ctwin" element={<CtwinDetail />} />
        </Routes>
      </div>
    </div>
  )
}
