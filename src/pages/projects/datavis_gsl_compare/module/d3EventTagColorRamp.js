import * as d3 from 'd3';

const colorMap = {};

export function filterByEvent(className,colorRamp,colorRamp2,change_color_bool){

    let type_event = d3.select("#type_event").node().value; 
    let color_type = d3.select("#color_type").node().value; 

    d3.selectAll(className)
    .style("opacity", function(d){
      //console.log(d);
      if(d.eventTags.includes(type_event) || type_event=="All"){
        return 1
      }else{
        return 0.07
      }
      
    }).style("pointer-events", 
      function(d){
        if(d.eventTags.includes(type_event) || type_event=="All"){
          return "all"
        }else{
          return "none"
        }
      }
    )


    if(change_color_bool=="change_color_true"){
        d3.selectAll(className)
        .style("fill", function(d){return colorRamp(showColorClass(d)) || "gray"}); // Change to the desired color (red in this case)    
    }
    
    d3.selectAll(className)
    .style("opacity", function(d){
      //console.log(d);
      if(d.eventTags.includes(type_event) || type_event=="All"){
        return 1
      }else{
        return 0.07
      }
      
    }).style("pointer-events", 
      function(d){
        if(d.eventTags.includes(type_event) || type_event=="All"){
          return "all"
        }else{
          return "none"
        }
      }
    )

    if(change_color_bool=="change_color_true"){
        d3.selectAll(className)
        .style("fill", function(d){return colorRamp(showColorClass(d)) || "gray"}); // Change to the desired color (red in this case)
    
    }

   
    if(change_color_bool=="change_color_true"){
  d3.selectAll(".d3_circle")             
    //.style("fill", function(d){return colorRamp(showColorClass(d)) || "gray"})
    .style("fill", function(d){      
      if(color_type=="GMM_cluster"){
        return colorRamp2(d.cluster_label) || "black"
      }
      if(color_type=="event_group"){
        return colorRamp(showColorClass(d)) || "black"}
      }    
    )
    }
   
  }//end of function

export function generateColorRamp(gridData){

    const firstLevelKeys = Object.keys(gridData.reduce((acc, row) => {
        row.forEach(key => {
            if (key) {
                let mainKey = key.split("--")[0]; // Extract the first-level key
                acc[mainKey] = true;
            }
        });
        return acc;
    }, {}));
    
    //schemeTableau10
    //
    const colorScale = d3.scaleOrdinal(d3.schemeSet2).domain(firstLevelKeys);
    //const colorScale = d3.scaleSequential(d3.interpolateRainbow);

    //const customColors = ["#a50026", "#d73027", "#f46d43", "#fdae61", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850","#006837"];
    
    //const colorScale = d3.scaleOrdinal(customColors).domain(firstLevelKeys);
    return colorScale;

}

/*
#a50026
#d73027
#f46d43
#fdae61
#fee08b
#d9ef8b
#a6d96a
#66bd63
#1a9850
#006837
*/

export function getColor1(key,colorScale) {

      const parts = key.split("--");
      
      if (parts.length === 1) {
          if (!colorMap[parts[0]]) {

              colorMap[parts[0]] = d3.color(colorScale(parts[0])).brighter(0.7);
          }
          return colorMap[parts[0]];
      } else if (parts.length === 2) {
          const parentColor = getColor1(parts[0]);
          if (!colorMap[key]) {
              colorMap[key] = d3.color(parentColor).brighter(0.01);
          }
          return colorMap[key];
      } else if (parts.length === 3) {
          const parentColor = getColor1(parts.slice(0, 2).join("--"));
          if (!colorMap[key]) {
              colorMap[key] = d3.color(parentColor).brighter(0.01);
          }
          return colorMap[key];
      }
  }

  export function getColor2(key,colorScale) {

    const parts = key.split("--");
    if (parts.length === 1) {
        if (!colorMap[parts[0]]) {

            colorMap[parts[0]] = d3.color(colorScale(parts[0]));
        }
        return colorMap[parts[0]];
    } else if (parts.length === 2) {
        const parentColor = getColor1(parts[0]);
        if (!colorMap[key]) {
            colorMap[key] = d3.color(parentColor).brighter(0.25);
        }
        return colorMap[key];
    } else if (parts.length === 3) {
        const parentColor = getColor1(parts.slice(0, 2).join("--"));
        if (!colorMap[key]) {
            colorMap[key] = d3.color(parentColor).brighter(0.5);
        }
        return colorMap[key];
    }
}


  // Map each key to a position in a grid based on the JSON structure
export function mapToGrid(obj) {
    const { maxDepth, endNodeCount } = analyzeStructure(obj);
  
    const grid = Array.from({ length: endNodeCount }, () => Array(maxDepth).fill(null));
    let currentRow = 0;
  
    function placeInGrid(node, level, parentKey = "") {
        for (const key in node) {
            const newKey = parentKey ? `${parentKey}::${key}` : key;
  
            if (Array.isArray(node[key])) {
                grid[currentRow][level] = newKey;
                currentRow++;
            } else if (typeof node[key] === 'object' && node[key] !== null) {
                grid[currentRow][level] = newKey;
                placeInGrid(node[key], level + 1, newKey);
            }
        }
    }
  
    placeInGrid(obj, 0);
    return grid;


    // Helper function to find max depth and count end nodes in the JSON structure
function analyzeStructure(obj, depth = 1) {
    let maxDepth = depth;
    let endNodeCount = 0;
    const isLeaf = node => typeof node === 'object' && node && Object.keys(node).every(key => Array.isArray(node[key]));
  
    function traverse(node, level) {
        // If it's a leaf, count end nodes directly
        if (isLeaf(node)) {
            endNodeCount += Object.keys(node).length;
            return level;
        }
  
        // Recursive case: deeper into the structure
        let localMaxDepth = level;
        for (const key in node) {
            if (typeof node[key] === 'object' && node[key] !== null) {
                const subDepth = traverse(node[key], level + 1);
                localMaxDepth = Math.max(localMaxDepth, subDepth);
            }
        }
        return localMaxDepth;
    }
  
    maxDepth = traverse(obj, depth);
    return { maxDepth, endNodeCount };
  }
  }

  export function showColorClass(d){  
    //console.log(d["eventTags"])    
    let res = d["eventTags"].split("/r/n");   
      
    let val = d3.select("#type_event").node().value; 
    let res_text = [];
    res.forEach(function(item2,index){
      //console.log(item, item.includes(val));
      ///if( item2.includes(val)){
        item2=item2.split("::").slice(0,2).join("::")
        if(res_text.indexOf(item2)==-1){
          res_text.push(item2)
        }
        //res_text+= item2+"<br>"
      ///}            
    })   
    //console.log(res_text)    
    return res_text.join("<br>")
  }//end of showColorClass

  export function showColorClassText(d){  
    //console.log(d["eventTags"])    
    let res = d["eventTags"].split("/r/n");   
      
    let val = d3.select("#type_event").node().value; 
    let res_text = "";
    res.forEach(function(item2,index){
      //console.log(item, item.includes(val));
      if( item2.includes(val)){
       
        res_text+= item2+"<br>"
    }            
    })   
    //      console.log(res_text)    
    return res_text     
  }//end of showColorClass

  export function defineColorCategory(all_class_color){
    const colorRamp = d3.scaleOrdinal()
        .domain(all_class_color) // Assign each category to the domain
        .range(d3.schemeCategory10); // Use d3's built-in color scheme (you can replace this with custom colors)

  }