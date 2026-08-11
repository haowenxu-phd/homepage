import { Routes, Route, BrowserRouter, useLocation  } from 'react-router-dom'
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
import ProjectDetail5, { GSLDetail } from "./pages/projects/gsl/gsl_landing.jsx"  
import ProjectDetail6, { RTDetail } from "./pages/projects/realtwin/rt_landing.jsx"

import ProjectDetail7, { VoxelGasDetail } from "./pages/projects/gas_dispersion_voxel/gas_voxel_landing.jsx"

import ProjectDetail8, { AgentAIFire } from "./pages/projects/agentic_ai_fire/agentic_ai_fire.jsx"
import ProjectDetail9, { VoxelAISurrogateModel } from "./pages/projects/fireSurrogateModel/AI_Voxel_landing.jsx"




import Teaching from "./pages/teaching/teaching.jsx"
import InteractiveLearning from "./pages/interactive_course/interative_course.jsx" 
import InteractiveLearning_c1_graph from "./pages/interactive_course/course_1_graph.jsx"
import InteractiveLearning_c2_routing from "./pages/interactive_course/course_2_navigation.jsx"
import InteractiveLearning_c3_optimization from "./pages/interactive_course/course_3_optimization.jsx"

// 🆕 Import the chatbot page
import FireAgentChatPage from "./pages/projects/fire_chat/FireAgentChatPage.jsx";

export default function App() {
  const location = useLocation();

  const isFirePage = location.pathname === "/portfolio/fire";

  return (
    <div className="app">
      <Nav />

      <div className={isFirePage ? "content-full" : "content"}>
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
          <Route path="/portfolio/gsl" element={<GSLDetail />} />
          <Route path="/portfolio/vr_digital_twins" element={<RTDetail />} />
          <Route path="/portfolio/3d_gas_dispersion" element={<VoxelGasDetail />} />

          <Route path="/portfolio/agenticAIFire" element={<AgentAIFire />} />
          <Route path="/portfolio/AIFireSurrogateModel" element={<VoxelAISurrogateModel />} /> 


          <Route path="/portfolio/fire" element={<FireAgentChatPage />} />
          <Route path="/teaching" element={<Teaching />} /> 
          <Route path="/learning" element={<InteractiveLearning />} /> 
          <Route path="/learning/course_1" element={<InteractiveLearning_c1_graph />} /> 
          <Route path="/learning/course_2" element={<InteractiveLearning_c2_routing />} /> 
          <Route path="/learning/course_3" element={<InteractiveLearning_c3_optimization />} /> 

          
          
          
        </Routes>
      </div>
    </div>
  );
}
