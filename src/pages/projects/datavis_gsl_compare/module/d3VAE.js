import * as d3 from 'd3v4';
 
import { d3BarChartPlot } from './d3BarChart.js'; // Import functions from utils.js
import { createHierachyPlot } from './d3TreeDiagram.js'; // Import functions from utils.js
import {getColor1, generateColorRamp,mapToGrid, filterByEvent, showColorClassText,  showColorClass} from "./d3EventTagColorRamp"


var showPreviousLatent = "";

function summarizeEvents(data){
    var eventsArray = data.map(d => d.eventTags).flat();
    let eventTagsArray = eventsArray
        .map(item => item.split('/r/n')) // Split each string into an array of event tags
        .flat()                          // Flatten the array of arrays into a single array
        .map(tag => tag.trim())          // Remove any extra whitespace
        .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates

     

  function buildHierarchy(tagsArray) {
    let tree = {};


    tagsArray.forEach(tag => {
        // Split the tag into parts based on '::' to create a hierarchy
        let parts = tag.split("::").map(part => part.trim()); // Normalize each part

        // Create a pointer to the current level in the tree
        let currentLevel = tree;

        parts.forEach((part, index) => {
            // If the part doesn't exist at the current level, create it
            if (!currentLevel[part]) {
                currentLevel[part] = (index === parts.length - 1) ? [] : {};
            }

            // If it's the last part of the tag, push the tag into an array (leaf node)
            if (index === parts.length - 1) {
                currentLevel[part].push(tag);
            } else {
                // Move the pointer to the next level in the tree
                currentLevel = currentLevel[part];
            }
        });
    });

    return tree;
}

 

let hierarchicalTree = buildHierarchy(eventTagsArray);
//console.log(JSON.stringify(hierarchicalTree, null, 2));

}

 

export function VaeScatterPlot(data, type_event, childChangeParent) {
  //console.log("called")

  

  let container = d3.select("#dataviz_axisZoom").node();
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 20, left: 30},        
        width = container.getBoundingClientRect().width - margin.left - margin.right,
        height = container.getBoundingClientRect().height - margin.top - margin.bottom;
        //let type_event = d3.select("#type_event").node().value; 

        let model_event = d3.select("#type_model").node().value; 
        
        


        let coord_by_model_type = {
          "VAE_latent":["latent_x","latent_y","latent_vectors"],
          "tft_embeddings":["embedding_x","embedding_y","embedding_vectors"],
          "VAE_LSTM_latent":["latent_x","latent_y","latent_vectors"],
        };

        let coord_fields = coord_by_model_type[model_event]

        //console.log("height",container.getBoundingClientRect().heigh)
        let all_class_color = [];

        let subsetdata=data.filter(row => row.eventTags.includes(type_event))
        subsetdata.forEach(function(item,index){

          let res_text = showColorClass(item);
           
          if(all_class_color.indexOf(res_text)==-1 && res_text.length!=0){
            all_class_color.push(res_text);
          }
          
        })
        //console.log(all_class_color);

        //const colorRamp = defineColorCategory(all_class_color)

        const colorRamp = d3.scaleOrdinal()
        .domain(all_class_color) // Assign each category to the domain
        .range(d3.schemeCategory10); // Use d3's built-in color scheme (you can replace this with custom colors)

        
        const colorRamp2 = d3.scaleOrdinal()
        .domain(all_class_color) // Assign each category to the domain
        .range(d3.schemeCategory20); // Use d3's built-in color scheme (you can replace this with custom colors)
               
    const svg = d3.select("#dataviz_axisZoom").select("svg");

    
        if (!svg.empty()) {
          //console.log("SVG exists!");
          
          filterByEvent(".pie-chart",colorRamp,colorRamp2,"change_color_true");
          filterByEvent(".d3_circle",colorRamp,colorRamp2,"change_color_true");
           
          return false;
        } else {
          console.log("SVG does not exist.");
          

        }
        d3.select("#dataviz_axisZoom").selectAll("*").remove();

        const tooltip = d3.select("#dataviz_axisZoom")
        .append("div")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        //.style("width", "300px")
        .style("display", "none")  // Hide the tooltip initially
        .style("pointer-events", "none");

    // append the SVG object to the body of the page
    var SVG = d3.select("#dataviz_axisZoom")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    //d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv", function(data) {
   // d3.csv(process.env.PUBLIC_URL + '/gsl/meta_df_latent_coord_tSNE.csv', function(data) {
      //console.log(data)
      // Calculate the extent (min and max) of the latent_x field from the data
      //console.log(data)
      //console.log(coord_fields)
      var xExtent = d3.extent(data, function(d) { return parseX(d[coord_fields[0]]); });
      var yExtent = d3.extent(data, function(d) { return parseY(d[coord_fields[1]]); });

      var gridData = createHierachyPlot(data);
      const colorScale =  generateColorRamp(gridData);
     
 
    var LatentVecExtent = data.reduce(function(acc, d) { 
        //console.log(d);
        let arr = d[coord_fields[2]].split(",").map(Number);
        let arrMin = Math.min(...arr);
        let arrMax = Math.max(...arr);
  
        // Update the accumulator with the global min and max
        if (acc.length === 0) {
            return [arrMin, arrMax];
        } else {
            return [
                Math.min(acc[0], arrMin),
                Math.max(acc[1], arrMax)
            ];
        }
    }, []);
  
    //LatentVecExtent = [-5.5]

 
      // Add X axis
      var x = d3.scaleLinear()
        .domain([xExtent[0]*1.2, xExtent[1]*1.2])
        .range([ 0, width ]);

      var xAxis = SVG.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([yExtent[0]*1.2, yExtent[1]*1.2])
        .range([ height, 0]);
      var yAxis = SVG.append("g")
        .call(d3.axisLeft(y));

      // Add a clipPath: everything out of this area won't be drawn.
      var clip = SVG.append("defs").append("SVG:clipPath")
          .attr("id", "clip")
          .append("SVG:rect")
          .attr("width", width )
          .attr("height", height )
          .attr("x", 0)
          .attr("y", 0);

      

      // Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
      var zoom = d3.zoom()
          .scaleExtent([.1, 100])  // This control how much you can unzoom (x0.5) and zoom (x20)
          .extent([[0, 0], [width, height]])
          .on("zoom", updateChart);

          //console.log("initial",d3.event.transform);

      // This add an invisible rect on top of the chart area. This rect can recover pointer events: necessary to understand when the user zoom
      SVG.append("rect")
          .attr("width", width)
          .attr("height", height)
          .style("fill", "none")
          .style("pointer-events", "all")
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
          .call(zoom);
      // now the user can zoom and it will trigger the function called updateChart


     
      // Create the scatter variable: where both the circles and the brush take place
      var scatter = SVG.append('g')
        .attr("clip-path", "url(#clip)")

    

    drawSVGRingChart(scatter,data);
    drawSVGCirclePlots(scatter,data);
    
    d3.selectAll(`.pie-chart`)
    .style("display", "none");
      
      // A function that updates the chart when the user zoom and thus new boundaries are available
      function updateChart() {
        // recover the new scale
        var newX = d3.event.transform.rescaleX(x);
        var newY = d3.event.transform.rescaleY(y);
 
        //onsole.log("Current zoom level:", d3.event.transform.k);
        let zoomLevel = d3.event.transform.k;
        if(zoomLevel<3){
          d3.selectAll(`.d3_circle`)
          .style("display", "block"); // Set desired opacity level
        
          d3.selectAll(`.pie-chart`)
          .style("display", "none"); // Set desired opacity level
        }else{
          d3.selectAll(`.d3_circle`)
          .style("display", "none"); // Set desired opacity level
        
          d3.selectAll(`.pie-chart`)
          .style("display", "block"); // Set desired opacity level
        }

        /*
       
      */

        // update axes with these new boundaries
        xAxis.call(d3.axisBottom(newX))
        yAxis.call(d3.axisLeft(newY))

        // update circle position
        scatter
          .selectAll("circle")
          .attr('cx', function(d) {return newX(parseX(d[coord_fields[0]]))})
          .attr('cy', function(d) {return newY(parseY(d[coord_fields[1]]))});

          scatter
          .selectAll(".pie-chart")
          .attr("transform", function(d) {
            return `translate(${newX(parseX(d[coord_fields[0]]))}, ${newY(parseY(d[coord_fields[1]]))})`;
    })
      }

      

    //})  //end of csv

    function parseX(latent_x){
      let res = (Number(latent_x));
      //console.log(res)
      return res;
    }

    function parseY(latent_y){
      let res = (Number(latent_y));
      
      return res;
    }

    function parseDuration(waveDuration){
      let provider_id = d3.select("#provider_id").node().value; 
      let trans = {
        "Provider_1":1,
        "Provider_2":0.005,
        "Provider_3":0.005,
        "Provider_4":0.005,
        "Provider_5":1
      }
      return waveDuration*trans[provider_id] || 1
    }

    function parseEvent(eventText){
      //console.log(eventText);
      let res = eventText.split("/r/n");
      let res_string = "";
      let val = d3.select("#type_event").node().value; 
      res.forEach(function(item,index){
        //console.log(item, item.includes(val));
        if(item.includes(val)){
          
          res_string+=item+"\n";
        }
        
      })
      return res_string;
    } //parseEvent

    function parseEventForClassKeyChangeStyle(eventText) {
      // Split the input text by line breaks
      let res = eventText.split("/r/n");
      let val = d3.select("#type_event").node().value;

      d3.selectAll(`.d3_tree_boxes`)
      .style("opacity", 0.2); // Set desired opacity level

      d3.selectAll(`.d3_tree_text`)
      .style("opacity", 0); // Set desired opacity level

      d3.selectAll(`.d3_tree_text_count`)
      .style("opacity", 0.5); // Set desired opacity level
      
      
      
  
      // Loop through each event tag to modify style for matching SVG elements
      res.forEach(function(item) {
          // Replace "::" with "-" and escape any spaces or underscores in the class name
          let className = item.split("::").join("--").split(" ").join("_")
          .split("&").join("_nd_").split("/").join("_or_");
          //console.log(`.${className}`, d3.selectAll(`.${className}`).size()); // Check the generated selector in the console

  
          // Select all elements matching the modified class name and change their style   
          d3.selectAll(`.${className}`)
              .style("opacity", 1); // Set desired opacity level

          // Select all elements matching the modified class name and change their style   
          d3.selectAll(`.${className.split("--")[0]}`)
              .style("opacity", 1); // Set desired opacity level

          d3.selectAll(`.${className.split("--")[0]+"--"+className.split("--")[1]}`)
              .style("opacity", 1); // Set desired opacity level
          });

          
  }

    

 
  

function drawSVGRingChart (scatter, data) {
  // Append groups instead of circles

    scatter.selectAll("g.pie-chart")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "pie-chart")
    .attr("transform", function(d) {
        return `translate(${x(parseX(d[coord_fields[0]]))}, ${y(parseY(d[coord_fields[1]]))})`;
    })
    .each(function(d) {
        
        drawPieChart(d3.select(this), colorRamp, d);
    })    
    .style("pointer-events", function(d){
        return (d.eventTags.includes(type_event) || type_event=="All") ? "all" : "none";
    })
    .style("opacity", function(d) { 
      if(d.id=="507"){
        //console.log("aa",d.eventTags,"--",type_event, d.eventTags.includes(type_event))
      }
      
      return (d.eventTags.includes(type_event) || type_event=="All") ? 1 : 0.1 }) 
    .on("mouseover", function(event, d) {
        tooltip.style("display", "block");

        // Call your tooltip update code here
        let dt = d3.select(this).datum();
        let inputString = dt[coord_fields[2]];
        d3BarChartPlot([inputString, showPreviousLatent], LatentVecExtent);
        //console.log(showPreviousLatent);
        tooltip.html( 
            `SigID: ${dt.id} <br>
            <b>Event Details:</b><br>
            ${showColorClassText(dt)} <br>
            <b>Color Catagories:</b><br>
            ${showColorClass(dt)}<br>
            <b>GMM Prob:</b><br>
            ${dt.cluster_prob || "N/A"}<br>
            <b>GMM Label:</b><br>
            ${dt.cluster_label || "N/A"}
            `
        );
        parseEventForClassKeyChangeStyle(dt.eventTags)
        // Position tooltip
        //console.log(d3.select(this).attr("transform"))
        let locstring = d3.select(this).attr("transform");
        const matches = locstring.match(/translate\(([^,]+),\s*([^)]+)\)/);
        //console.log(matches[1],matches[2]) 
        tooltip.style("left", (matches[1])  + "px"); 
        tooltip.style("top", Number(matches[2])+60 + "px");

         
    })
    .on("mousemove", function(event) {
      let locstring = d3.select(this).attr("transform");
      const matches = locstring.match(/translate\(([^,]+),\s*([^)]+)\)/);
     
    })
    .on("mouseout", function(event, d) {
        tooltip.style("display", "none");
        let dt = d3.select(this).datum();
        let inputString = dt[coord_fields[2]];
        showPreviousLatent = inputString;
    });


    /*scatter.selectAll("text.pie-chart")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "pie-chart")
    .attr("x", d => x(parseX(d.latent_x)))  // Use x attribute for positioning
    .attr("y", d => y(parseY(d.latent_y)))  // Use y attribute for positioning
    .attr("text-anchor", "middle")  // Center-align the text
    .attr("dy", "0.35em")  // Adjust to vertically center text
    .text("aaaa")  // Set static text for testing
    .style("font-size", "10px")
    .style("opacity", d => d.eventTags.includes(type_event) ? 1 : 0.1)
    .style("fill", "black");*/


    function drawPieChart(selection, colorScale, dtp) {
      const data = [];
    
      let allClassEventsArray = dtp["eventTags"].split("/r/n");
      
      allClassEventsArray.forEach(function(item, index) {
        let className = item.split("::").join("--").split(" ").join("_");
        let color = getColor1(className, colorScale);
        data.push({
          key: className, 
          colorval: color,
          value: 1 / allClassEventsArray.length * 100
        });
      });
    
      const pie = d3.pie().value(d => d.value);
      const arc = d3.arc()
        .innerRadius(5)  // Inner radius for a ring; set to 0 for a pie chart
        .outerRadius(18 + Number( parseDuration(dtp.waveDuration)) * 12);
    
      // Bind data and create pie chart paths
      const arcs = selection.selectAll("path")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => d.data.colorval)
        .style("stroke", d => colorRamp(showColorClass(dtp)) || "gray")
        .style("stroke-width", 4)
        /*.style("opacity", function(d) { 
          if(dtp.id=="507"){
            console.log("aa",dtp.eventTags,"--",type_event, dtp.eventTags.includes(type_event))
          }
          
          return dtp.eventTags.includes(type_event) ? 1 : 0.1 }) ;*/
    
      // Append text elements to the center of each arc
      selection.selectAll("text")
        .data(pie(data))
        .enter()
        .append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)  // Position the text at the arc center
        .attr("text-anchor", "middle")  // Center-align the text
        .attr("dy", "0.30em")  // Center vertically
        .text(function(d){
          let className = d.data["key"].split("--");
          //console.log(className.at(-1))
          return className.at(-1)[0];
        }
        )  // Set the text content to "1"
        .style("font-size", "10px")  // Adjust font size as needed
        //.style("opacity", function(d){ return dtp.eventTags.includes(type_event) ? 1 : 0.1 } )
        .style("fill", "black");  // Set text color


       


        
    }

} //end of draw ringchart


function drawSVGCirclePlots(scatter,data){
  // Add circles
  let color_type = d3.select("#color_type").node().value; 

  scatter
  .selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("class", "d3_circle")
    .attr("cx", function (d) { 
      
      return x( parseX(d[coord_fields[0]])) ;
    } )
    .attr("cy", function (d) { 
      
      return y( parseY(d[coord_fields[1]])) ; 
    } )
    .attr("data", function (d) { 
      
      return d ;
    } )
    .attr("r", function(d){
      return 5+Number( parseDuration(d.waveDuration))*4;
    })        
    //.style("fill", function(d){return colorRamp(showColorClass(d)) || "gray"})
    .style("fill", function(d){      
      if(color_type=="GMM_cluster"){
        return colorRamp2(d.cluster_label) || "black"
      }
      if(color_type=="event_group"){
        return colorRamp(showColorClass(d)) || "black"}
      }    
    )
    //.style("stroke-width", function(d){  return 5+Number(parseDuration(d.waveDuration))*3;  })
    .style("stroke", function(d){ return "#383838"  })
    .style("stroke-width", function(d){  return 2  })
    .style("opacity", function(d){
      if(d.eventTags.includes(type_event) || type_event=="All"){
        return 1
      }else{
        return 0.07
      }
    })
    .style("pointer-events", 
      function(d){
        if(d.eventTags.includes(type_event) || type_event=="All"){
          return "all"
        }else{
          return "none"
        }
      } 
    )
    .on("mouseover", function(event, d) {
      tooltip.style("display", "block");
      //console.log(d3.select(this).datum());
      let dt = d3.select(this).datum();

      //console.log(dt["latent_vectors"])
      let inputString = dt[coord_fields[2]];
      d3BarChartPlot([inputString, showPreviousLatent],LatentVecExtent);
      //console.log(dt)
      tooltip.html( 
        `SigID: ${dt.id} <br>
            <b>Event Details:</b><br>
            ${showColorClassText(dt)} <br>
            <b>Color Catagories:</b><br>
            ${showColorClass(dt)}<br>
            <b>GMM Prob:</b><br>
            ${dt.cluster_prob || "N/A"}<br>
            <b>GMM Label:</b><br>
            ${dt.cluster_label || "N/A"}
            `
      );
      //${showColorClassText(dt)}
      parseEventForClassKeyChangeStyle(dt.eventTags)
      let height = tooltip.node().getBoundingClientRect().height;
      let pageTop = d3.select(this).attr("cy")+margin.top;
      let pageLeft = d3.select(this).attr("cx")+margin.left;
      tooltip.style("left", (parseInt(pageLeft) +60 )  + "px");  // Adjust position of tooltip
      tooltip.style("top", parseInt(pageTop) + 50 + "px");
    })         
    .on("mousemove", function(event) {
      let height = tooltip.node().getBoundingClientRect().height;
      let pageTop = d3.select(this).attr("cy")+margin.top;
      let pageLeft = d3.select(this).attr("cx")+margin.left;
      tooltip.style("left", parseInt(pageLeft)+60 + "px");
      tooltip.style("top", parseInt(pageTop) + 50 + "px");
    })
    .on("mouseout", function() {
      tooltip.style("display", "none");
      let dt = d3.select(this).datum();
      let inputString = dt[coord_fields[2]];
       showPreviousLatent = inputString;
      /*
      d3.selectAll(`.d3_tree_boxes`)
      .style("opacity", 0.2); // Set desired opacity level
      */
    });
}

}//outer class function end brackets


