import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse'; // Assuming you're using PapaParse for parsing CSV
import { VaeScatterPlot } from './module/d3VAE.js'; // Import functions from utils.js
import { d3BarChartPlot } from './module/d3BarChart.js'; // Import functions from utils.js
//import { d3BarChartPlot } from './module/d3BarChart.js'; // Import functions from utils.js
import './dataVisGSL.css';
import * as d3 from 'd3v4';

import 'bootstrap/dist/css/bootstrap.min.css';


function DataVisGSL() {
  const [VAEDataTSNE, setVAEDataTSNE] = useState(null);
  const [VAEDataPCA, setVAEDataPCA] = useState(null);
  const [VAEData, setVAEData] = useState(null);
  const [eventType, setEventType] = useState("Events::"); // State to hold the converted JSON data
  const [clusterType, setclusterType] = useState("t-SNE"); // State to hold the converted JSON data
  const [VaeDim, setVaeDim] = useState("dim_256"); // State to hold the converted JSON data
  const [VAEDataGmm, setVAEDataGmm] = useState(); // State to hold the converted JSON data 
  const [modelType, setModelType] = useState("VAE_latent"); // State to hold the converted JSON data       tft_embeddings
  const [VAEUmapData, setVAEUmapData] = useState(); // State to hold the converted JSON data
  const [shouldDisableControl,setShouldDisableControl] = useState("false")
  const [colorCodeStyle, setColorCodeStyle] = useState("event_group")
  const [previousLatent, setPreviousLatent] = useState()

  const [providerID,setProviderID] = useState("Provider_1A")

  const base = import.meta.env.BASE_URL; // usually "/"

  console.log(base+'projects/gsl/'+providerID+'/'+VaeDim+'/meta_df_'+modelType+'_tSNE-GMM.csv');
  // Function to convert CSV data to JSON
   // UseEffect to load CSV data and set VAEData
   useEffect(() => {

    let url_base = '/projects/gsl/Provider_1A/Dim_256/meta_df_tft_embeddings_PCA-GMM.csv';
 

    d3.csv('./projects/gsl/'+providerID+'/'+VaeDim+'/meta_df_'+modelType+'_tSNE-GMM.csv', function(data) {
      setVAEDataTSNE(data);  // Set the data
    });

    d3.csv('./projects/gsl/'+providerID+'/'+VaeDim+'/meta_df_'+modelType+'_PCA-GMM.csv', function(data) {
      //console.log(data)
      setVAEDataPCA(data);  // Set the data
    });

    d3.csv('./projects/gsl/'+providerID+'/'+VaeDim+'/meta_df_'+modelType+'.csv', function(data) {
      setVAEData(data);  // Set the data
      setShouldDisableControl("")
    });

    d3.csv('./projects/gsl/'+providerID+'/'+VaeDim+'/meta_df_'+modelType+'_UMAP-GMM.csv', function(data) {
      setVAEUmapData(data);  // Set the data
      setShouldDisableControl("",)
    });

    //
    d3BarChartPlot(["",""],[-3,3]);

  }, [VaeDim,modelType,providerID]); // Empty array to ensure it runs once when component mounts

  // UseEffect to monitor changes to VAEData and call VaeScatterPlot when it updates
  useEffect(() => {
  
    if (clusterType=="t-SNE" && VAEDataTSNE) {
      //console.log("VAEData updated:", VAEData);  // Log the updated data
      VaeScatterPlot(VAEDataTSNE, eventType, childChangeParent); // Call your scatter plot function with the updated data
    }
   

  }, [VAEDataTSNE]);  // Runs whenever VAEData is updated


    // UseEffect to monitor changes to VAEData and call VaeScatterPlot when it updates
    useEffect(() => {
      
      if (clusterType=="PCA" && VAEDataPCA) {
        //console.log("VAEData updated:", VAEData);  // Log the updated data
        VaeScatterPlot(VAEDataPCA, eventType, childChangeParent); // Call your scatter plot function with the updated data
      }
    }, [VAEDataPCA]);  // Runs whenever VAEData is updated
  
  
    // UseEffect to monitor changes to VAEData and call VaeScatterPlot when it updates
    useEffect(() => {
     
  
      if (clusterType=="VAE_Lat" && VAEData) {
        //console.log("VAEData updated:", VAEData);  // Log the updated data
        VaeScatterPlot(VAEData, eventType, childChangeParent); // Call your scatter plot function with the updated data
      }
   
  
    }, [VAEData]);  // Runs whenever VAEData is updated
  
    
    // UseEffect to monitor changes to VAEData and call VaeScatterPlot when it updates
    useEffect(() => {
      
      if (clusterType=="UMAP" && VAEUmapData) {
        //console.log("VAEData updated:", VAEData);  // Log the updated data
        VaeScatterPlot(VAEUmapData, eventType, childChangeParent); // Call your scatter plot function with the updated data
      }
  
    }, [VAEUmapData]);  // Runs whenever VAEData is updated
  
    
    // UseEffect to monitor changes to VAEData and call VaeScatterPlot when it updates
    /*useEffect(() => {
      console.log(clusterType);
      if (clusterType=="t-SNE" && VAEDataTSNE) {
        //console.log("VAEData updated:", VAEData);  // Log the updated data
        VaeScatterPlot(VAEDataTSNE, eventType); // Call your scatter plot function with the updated data
      }
  
      if (clusterType=="PCA" && VAEDataPCA) {
        //console.log("VAEData updated:", VAEData);  // Log the updated data
        VaeScatterPlot(VAEDataPCA, eventType); // Call your scatter plot function with the updated data
      }
  
      if (clusterType=="VAE_Lat" && VAEData) {
        //console.log("VAEData updated:", VAEData);  // Log the updated data
        VaeScatterPlot(VAEData, eventType); // Call your scatter plot function with the updated data
      }
  
      if (clusterType=="UMAP" && VAEUmapData) {
        //console.log("VAEData updated:", VAEData);  // Log the updated data
        VaeScatterPlot(VAEUmapData, eventType); // Call your scatter plot function with the updated data
      }
  
    }, [VAEDataTSNE,VAEDataPCA,VAEData]);  // Runs whenever VAEData is updated*/
  


  useEffect(() => {    

    if (clusterType=="t-SNE" && VAEDataTSNE) {
      //console.log("VAEData updated:", VAEData);  // Log the updated data
      VaeScatterPlot(VAEDataTSNE, eventType, childChangeParent); // Call your scatter plot function with the updated data
    }

    if (clusterType=="PCA" && VAEDataPCA) {
      //console.log("VAEData updated:", VAEData);  // Log the updated data
      VaeScatterPlot(VAEDataPCA, eventType, childChangeParent); // Call your scatter plot function with the updated data
    }

    if (clusterType=="VAE_Lat" && VAEData) {
      //console.log("VAEData updated:", VAEData);  // Log the updated data
      VaeScatterPlot(VAEData, eventType, childChangeParent); // Call your scatter plot function with the updated data
    }

    if (clusterType=="UMAP" && VAEUmapData) {
      //console.log("VAEData updated:", VAEData);  // Log the updated data
      VaeScatterPlot(VAEUmapData, eventType, childChangeParent); // Call your scatter plot function with the updated data
    }



  }, [eventType, clusterType, colorCodeStyle]);  // Runs whenever VAEData is updated

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
    const val = e.target.value; // "Provider_1", "Provider_1A", "Provider_2", ...

    // wipe current viz/data
    d3.select("#dataviz_axisZoom").selectAll("*").remove();

    setShouldDisableControl(true);   // boolean, not "true"
    setVAEDataTSNE(null);
    setVAEDataPCA(null);
    setVAEUmapData(null);

    // If provider is NOT 1 or 1A, force modelType to TFT
    if (val !== "Provider_1" && val !== "Provider_1A") {

      setModelType("tft_embeddings");


    } else {
      // (optional) ensure a valid default for 1/1A
      if (!["tft_embeddings", "VAE_latent", "VAE_LSTM_latent"].includes(modelType)) {
        setModelType("VAE_latent");
      }
      if (val == "Provider_1A"){ 
          //console.log("VaeDim",VaeDim.split("_")[1], Number(VaeDim.split("_")[1])>480)
          if(Number(VaeDim.split("_")[1])>480){

              setVaeDim("dim_480");
          } 

          setProviderID(val);
      };      
      
    }

    setProviderID(val);
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
              <p><b> 1. Configuration </b></p>
              <div className="col-md-12 mt-2 mb-2">
                      <div className="form-group formGroup">
                        <label htmlFor="provider_id">Dataset/Provider ID</label>
                        <select id="provider_id" className="form-control menueSelect" value={providerID} onChange={handleChange5}>
                          <option value="Provider_1">1</option>
                          <option value="Provider_1A">1A</option>
                          <option value="Provider_2">2</option>   
                          <option value="Provider_3">3</option>  
                          <option value="Provider_4">4</option>  
                                           
                        </select>
                      </div>
                    </div>

              <div className="col-md-12 mt-2 mb-2">
                      <div className="form-group formGroup">
                        <label htmlFor="type_model">AI Model</label>
                        <select
                          id="type_model"
                          className="form-control menueSelect"
                          value={modelType}
                          onChange={handleChange4}
                          disabled={!providerID} // Disable if no provider is selected
                        >
                          {providerID === "Provider_1" && (
                            <>
                              <option value="tft_embeddings">Temporal Fusion Transformers</option>
                              <option value="VAE_latent">VAE-1D Conv1D</option>
                              <option value="VAE_LSTM_latent">VAE LSTM</option>
                              
                            </>
                          )}
                          {providerID === "Provider_1A" && (
                            <>
                              
                              <option value="tft_embeddings">Temporal Fusion Transformers</option>
                              <option value="VAE_latent">VAE-1D Conv1D</option>
                              <option value="VAE_LSTM_latent">VAE LSTM</option>
                              
                            </>
                          )}
                          {["Provider_2","Provider_3","Provider_4"].indexOf(providerID)!=-1 && (
                            <>
                              <option value="tft_embeddings">Temporal Fusion Transformers</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>


                

                    <div className="col-md-12 mt-2 mb-2">
                      <div className="form-group formGroup">
                        <label htmlFor="type_event">Label Catagory</label>
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

                    <div className="col-md-12 mt-2 mb-2">
                      <div className="form-group">
                        <label htmlFor="cluster_event">2D Representation</label>
                        <select id="cluster_event" className="form-control" value={clusterType} onChange={handleChange2}>
                        <option value="PCA">PCA</option>
                        <option value="t-SNE">t-SNE</option>
                        <option value="UMAP">UMAP</option>                        
                        {/*<option value="VAE_Lat">Latent Space Coord (First 2)</option>*/}
                      </select>
                      </div>
                    </div>

                    <div className="col-md-12 mt-2 mb-2">
                      <div className="form-group">
                        <label htmlFor="type_event">Model Dimension</label>
                        <select id="VAE_Dim" className="form-control" 
                        disabled= {shouldDisableControl}
                        value={VaeDim} onChange={handleChange3}>


                            {providerID === "Provider_1" && (
                            <>
                              
                              <option value="dim_8">8</option> 
                              <option value="dim_32">32</option>   
                              <option value="dim_64">64</option>   
                              <option value="dim_128">128</option>   
                              <option value="dim_256">256</option>  
                              <option value="dim_360">360</option>  
                              <option value="dim_480">480</option>    
                              <option value="dim_640">640</option>  
                              <option value="dim_800">800</option>                  
                              
                            </>
                          )}

                            {providerID === "Provider_1A" && (
                            <>
                              
                              <option value="dim_8">8</option> 
                              <option value="dim_32">32</option>   
                              <option value="dim_64">64</option>   
                              <option value="dim_128">128</option>   
                              <option value="dim_256">256</option>  
                              <option value="dim_360">360</option>  
                              <option value="dim_480">480</option>                     
                              
                            </>
                          )}
                          {["Provider_2","Provider_3","Provider_4"].indexOf(providerID)!=-1 && (
                            <>
                              <option value="dim_8">8</option> 
                              <option value="dim_32">32</option>   
                              <option value="dim_64">64</option>   
                              <option value="dim_128">128</option>   
                              <option value="dim_256">256</option>  
                              <option value="dim_360">360</option>  
                              <option value="dim_480">480</option>  
                              <option value="dim_640">640</option>  
                              <option value="dim_800">800</option> 
                            </>
                          )}




                        
                      </select>
                      </div>
                    </div>

                    <div className="col-md-12 mt-2 mb-2">
                      <div className="form-group">
                        <label htmlFor="color_type">Color Coding</label>
                        <select id="color_type" className="form-control"                         
                        value={colorCodeStyle} onChange={handleChange6}>
                        <option value="GMM_cluster">GMM Clustering</option> 
                        <option value="hDBSCAN_cluster">HDBSCAN</option> 
                        <option value="event_group">Multilabel Events</option>   
                      </select>
                      </div>
                    </div>
                </div>

                <span className="col-md-10 visContainer2">  
                      <p  className="visTitle"><b>2. Latent Space Cartography</b></p>  
                      <div id="dataviz_axisZoom" className="col-md-12">
                      </div>          
                    
                </span>

                <span className="col-md-12">  
                      <p className="visTitle"><b>3. Latent Vectors / Embeddings</b></p>        
                      <div className="row col-md-12 row" id="d3_latent_vector_bar">                      
                      </div>
                </span> 
              </span>   

              <div className="col-md-4 row ">      
                  <p className="visTitle"><b>4. Hierarchical Multilabel Tree</b></p>                              
                  <div className="row col-md-12" id="d3_tree_diagram"></div>                    
              </div>

                  
              
          </div> 
         
      </div>
          

  );
}

export default DataVisGSL;