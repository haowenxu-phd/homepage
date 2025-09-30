import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse'; // Assuming you're using PapaParse for parsing CSV
import { VaeScatterPlot } from './module/d3VAE.js'; // Import functions from utils.js
import { d3BarChartPlot } from './module/d3BarChart.js'; // Import functions from utils.js
//import { d3BarChartPlot } from './module/d3BarChart.js'; // Import functions from utils.js
import './dataVisGSL_c.css';
import * as d3 from 'd3v4';

import 'bootstrap/dist/css/bootstrap.min.css';


function DataVisGSL() {
  const [VAEDataTSNE, setVAEDataTSNE] = useState(null);
  const [VAEDataPCA, setVAEDataPCA] = useState(null);
  const [VAEData, setVAEData] = useState(null);
  const [eventType, setEventType] = useState("Events::"); // State to hold the converted JSON data
  const [clusterType, setclusterType] = useState("t-SNE"); // State to hold the converted JSON data
  const [VaeDim, setVaeDim] = useState("dim_128"); // State to hold the converted JSON data
  const [VAEDataGmm, setVAEDataGmm] = useState(); // State to hold the converted JSON data
  const [modelType, setModelType] = useState("tft_embeddings"); // State to hold the converted JSON data  
  const [VAEUmapData, setVAEUmapData] = useState(); // State to hold the converted JSON data
  const [shouldDisableControl,setShouldDisableControl] = useState("false")
  const [colorCodeStyle, setColorCodeStyle] = useState("event_group")
  const [previousLatent, setPreviousLatent] = useState()

  const [providerID,setProviderID] = useState("Provider_1")
  // Function to convert CSV data to JSON
   // UseEffect to load CSV data and set VAEData
   useEffect(() => {
   

    d3.csv(process.env.PUBLIC_URL + '/gsl/'+providerID+'/'+VaeDim+'/meta_df_'+modelType+'_tSNE-GMM.csv', function(data) {
      setVAEDataTSNE(data);  // Set the data
    });

    d3.csv(process.env.PUBLIC_URL + '/gsl/'+providerID+'/'+VaeDim+'/meta_df_'+modelType+'_PCA-GMM.csv', function(data) {
      //console.log(data)
      setVAEDataPCA(data);  // Set the data
    });

    d3.csv(process.env.PUBLIC_URL + '/gsl/'+providerID+'/'+VaeDim+'/meta_df_'+modelType+'.csv', function(data) {
      setVAEData(data);  // Set the data
      setShouldDisableControl("")
    });

    d3.csv(process.env.PUBLIC_URL + '/gsl/'+providerID+'/'+VaeDim+'/meta_df_'+modelType+'_UMAP-GMM.csv', function(data) {
      setVAEUmapData(data);  // Set the data
      setShouldDisableControl("",)
    });

    //
    //d3BarChartPlot(["",""],[-3,3]);

  }, [VaeDim,modelType,providerID]); // Empty array to ensure it runs once when component mounts

   

  const handleChange = (e) => {
    setEventType(e.target.value); // Update the state with the selected value
  };
  const handleChange2 = (e) => {
    d3.select("#dataviz_axisZoom").selectAll("*").remove();
    setclusterType(e.target.value); // Update the state with the selected value
  };

  const handleChange3 = (e) => {
    d3.select("#dataviz_axisZoom").selectAll("*").remove();
    
    setShouldDisableControl("true")
    setVAEDataTSNE()
    setVAEDataPCA()
    setVAEUmapData()
    setVaeDim(e.target.value); // Update the state with the selected value
  };

  const handleChange4 = (e) => {
    d3.select("#dataviz_axisZoom").selectAll("*").remove();
    
    setShouldDisableControl("true")
    setVAEDataTSNE()
    setVAEDataPCA()
    setVAEUmapData()
    setModelType(e.target.value); // Update the state with the selected value
  };

  const handleChange5 = (e) => {
    d3.select("#dataviz_axisZoom").selectAll("*").remove();
    
    setShouldDisableControl("true")
    setVAEDataTSNE()
    setVAEDataPCA()
    setVAEUmapData()
    setProviderID(e.target.value); // Update the state with the selected value
  };

  const handleChange6 = (e) => {
    setColorCodeStyle(e.target.value); // Update the state with the selected value
  };

  function childChangeParent(actionType, input){
     
      if (actionType == "set"){
        
        setPreviousLatent(input)
        console.log(previousLatent)
      }
      if (actionType == "get"){
        return previousLatent
      }
  }
  

  return (
    <div className='row col-md-12 row dataVis'>

        {/* Add your map and other components here */}
 
        
          <div className="row col-md-12 mb-2 mt-2">
             
              <span className="col-md-8 visContainer row">   
              <div className="col-md-2">

              <div className="col-md-12 mt-2 mb-2">
                      <div className="form-group formGroup">
                        <label htmlFor="provider_id">Provider ID</label>
                        <select id="provider_id" className="form-control menueSelect" value={providerID} onChange={handleChange5}>
                          <option value="Provider_1">1</option>
                        
                                           
                        </select>
                      </div>
                    </div>

                    <div className="col-md-12 mt-2 mb-2">
                      <div className="form-group formGroup">
                        <label htmlFor="type_model">AI Model 1</label>
                        <select
                          id="type_model"
                          className="form-control menueSelect"
                          value={modelType}
                          onChange={handleChange4}
                          disabled={!providerID} // Disable if no provider is selected
                        >
                              <option value="VAE_latent">VAE Conn- TFT</option>
                          
                        </select>
                      </div>
                    </div>

                    



                  {

                      /**
                       * 
                      <div className="col-md-12 mt-2 mb-2">
                      <div className="form-group formGroup">
                            <label htmlFor="type_event">Event Type</label>
                            <select id="type_event" className="form-control menueSelect" value={eventType} onChange={handleChange}>
                              <option value="Conditions::">Conditions</option>
                              <option value="Device::">Device</option>
                              <option value="Events::">Event</option>
                              <option value="Equipment::">Equipment</option>
                              <option value="State::">State</option>
                              <option value="Phase::">Phase</option>
                              <option value="All">All</option>
                            </select>
                          </div>
                        </div>
                       */

                  }

                    

                    <div className="col-md-12 mt-2 mb-2">
                      <div className="form-group">
                        <label htmlFor="cluster_event">Cluster Type</label>
                        <select id="cluster_event" className="form-control" value={clusterType} onChange={handleChange2}>
                        <option value="PCA">PCA</option>
                        <option value="t-SNE">t-SNE</option>
                        <option value="UMAP">UMAP</option>                        
                        <option value="VAE_Lat">Latent Space Coord (First 2)</option>
                      </select>
                      </div>
                    </div>

                    <div className="col-md-12 mt-2 mb-2">
                      <div className="form-group">
                        <label htmlFor="type_event">VAE Dim</label>
                        <select id="VAE_Dim" className="form-control" 
                        disabled= {shouldDisableControl}
                        value={VaeDim} onChange={handleChange3}>
                        <option value="dim_8">8</option> 
                        <option value="dim_32">32</option>   
                        <option value="dim_64">64</option>   
                        <option value="dim_128">128</option>   
                        <option value="dim_256">256</option>  
                        <option value="dim_360">360</option>  
                        <option value="dim_480">480</option>  
                        <option value="dim_640">640</option>  
                        <option value="dim_800">800</option> 
                      </select>
                      </div>
                    </div>

                    <div className="col-md-12 mt-2 mb-2">
                      <div className="form-group">
                        <label htmlFor="color_type">Color Coding</label>
                        <select id="color_type" className="form-control"                         
                        value={colorCodeStyle} onChange={handleChange6}>
                        <option value="GMM_cluster">GMM Cluster</option> 
                        <option value="event_group">Event Group</option>   
                      </select>
                      </div>
                    </div>
                </div>

                <span className="col-md-10 visContainer2">  
                      <p  className="visTitle">Latent Coordinates</p>  
                      <div id="dataviz_axisZoom" className="col-md-12 border">
                      </div>          
                    
                </span>

              
              </span>   

              <div className="col-md-4 row ">      
                  <p className="visTitle">Event Tags Tree</p>                              
                  <div className="row col-md-12" id="d3_tree_diagram"></div>                    
              </div>

                  
              
          </div> 
         
      </div>
          

  );
}

export default DataVisGSL;