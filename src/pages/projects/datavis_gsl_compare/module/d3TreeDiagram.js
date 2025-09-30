import * as d3 from 'd3v4';
import {getColor1, generateColorRamp,mapToGrid, filterByEvent} from "./d3EventTagColorRamp"
 
function drawGridDots(gridData,eventTagsCount) {

    //console.log("gridData",gridData);

  let container = d3.select("#d3_tree_diagram");
  const margin = { top: 20, right: 30, bottom: 20, left: 30 };

  container.selectAll("*").remove();

  const dotWidth = 100; // Width of each rectangle
  const dotHeight = 10; // Height of each rectangle

  const numCols = gridData[0].length;
  const numRows = gridData.length;

  const spacingX = 1.5;
  const spacingY = 1.2;

  let width_t = container.node().getBoundingClientRect().width;
  let height_t = container.node().getBoundingClientRect().height;
  const width = width_t + margin.left + margin.right;
  //const width = numCols * dotWidth * spacingX + margin.left + margin.right;
  
  const height = height_t + margin.top + margin.bottom;
  //const height = numRows * dotHeight * spacingY + margin.top + margin.bottom;

  container.selectAll("*").remove();

  // Create the SVG container with zoom functionality
  const svg = container.append("svg")
      .attr("width", width)
      .attr("height", height)
      .call(d3.zoom()
          .scaleExtent([0.5, 5])    // Define zoom scale limits
          .on("zoom", zoomed));     // Add zoom event listener

  // Create an inner group to hold the grid, so that zoom and pan affect only this group
  const gridGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Zoom function to transform the inner group
  function zoomed() {
      gridGroup.attr("transform", d3.event.transform); // Use d3.event in D3 v4
  }

  // Generate distinct hues for each first-level category
  const colorScale =  generateColorRamp(gridData);
  
 

  // Function to get color for each level based on hierarchy
  const colorMap = {};
  function getColor(key) {
      const parts = key.split("--");
      if (parts.length === 1) {
          if (!colorMap[parts[0]]) {
              colorMap[parts[0]] = d3.color(colorScale(parts[0]));
          }
          return colorMap[parts[0]];
      } else if (parts.length === 2) {
          const parentColor = getColor(parts[0]);
          if (!colorMap[key]) {
              colorMap[key] = d3.color(parentColor).brighter(0.5);
          }
          return colorMap[key];
      } else if (parts.length === 3) {
          const parentColor = getColor(parts.slice(0, 2).join("--"));
          if (!colorMap[key]) {
              colorMap[key] = d3.color(parentColor).brighter(1.0);
          }
          return colorMap[key];
      }
  }
  //replace(/::/g, "-")
  // Append rectangles to the SVG based on the grid data
  gridData.forEach((row, rowIndex) => {
      row.forEach((key, colIndex) => {
          if (key !== null) {
              const className = key.split("::").join("--").split(" ").join("_")
              .split("&").join("_nd_").split("/").join("_or_");
              const color = getColor1(className, colorScale);
              
              // Add rectangle to the grid group
              gridGroup.append("rect")
                  .attr("x", colIndex * dotWidth + dotWidth * colIndex)
                  .attr("y", rowIndex * dotHeight * spacingY)
                  .attr("width", dotWidth + (1+colIndex)*dotWidth*0.35 )
                  .attr("height", dotHeight)
                  .attr("class", `${className} d3_tree_boxes`)
                  .style("fill", color)
                  .style("opacity", 0.2)
                  .attr("data", function (d) {       
                    return className ; 
                  } )      
                  
            
                d3.selectAll(".d3_tree_boxes")
                  .on("mouseover", function(event, d) {
                    
                    let matching = d3.select(this).attr("data");
                    changeD3VAEScatter(".pie-chart", matching);
                    changeD3VAEScatter(".d3_circle", matching);  
                    d3.selectAll(`.${matching}`).style("opacity", 1);   
                    
                }).on("mouseout", function(event, d) {
                    let matching = d3.select(this).attr("data");
                    filterByEvent(".pie-chart",[],[],"change_color_false");
                    filterByEvent(".d3_circle",[],[],"change_color_false");
                    d3.selectAll(`.d3_tree_boxes`).style("opacity", 0.2);   
                    d3.selectAll(`.d3_tree_text`).style("opacity", 0.3);   
                    d3.selectAll(`.d3_tree_text_count`).style("opacity", 0.5); 
                    
                });

                //defineColorCategory
                  //eventTagsCount
            
              gridGroup.append("text")
                  .attr("x",  colIndex * dotWidth + dotWidth * colIndex*1.2 ) // Center text in the rectangle
                  .attr("y",  rowIndex * dotHeight * spacingY + dotHeight*0.75  ) // Center text vertically in the rectangle
                  .attr("text-anchor", "left")
                  .attr("alignment-baseline", "bottom")
                  .style("fill", "black")
                  .style("font-size", "10px")
                  .style("opacity", 0.3)
                  .attr("class", `${className} d3_tree_text`)
                  .style("pointer-events","none")
                  .style("font-weight", "bold")
                  .text(key.split("::").pop()); // Use the last part of the key as the text

              gridGroup.append("text")
                  .attr("x",  colIndex * dotWidth + dotWidth * colIndex -5  ) // Center text in the rectangle
                  .attr("y",  rowIndex * dotHeight * spacingY + dotHeight*0.75 ) // Center text vertically in the rectangle
                  .attr("text-anchor", "end")
                  .attr("alignment-baseline", "bottom")
                  .style("fill", "black")
                  .style("font-size", "9px")
                  .style("opacity", 0.5)
                  .attr("class", `${className} d3_tree_text_count`)
                  .style("pointer-events","none")
                  .style("font-weight", "bold")
                  .text(eventTagsCount[key]); // Use the last part of the key as the text
 
 
          }
      });
  });
}
 
 function generatePlots(data){
          // Set the dimensions and margins of the diagram
        let container = d3.select("#d3_tree_diagram").node();
        const margin = { top: 20, right: 90, bottom: 30, left: 90 };
        const width = container.getBoundingClientRect().width - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        d3.select("#d3_tree_diagram").selectAll("*").remove();
        // Append the SVG object to the container
        // Append the SVG object to the body of the page
        const svg = d3.select("#d3_tree_diagram").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Create a tree layout and set its size
        const treemap = d3.tree().size([width, height]); // Width is now the horizontal space, and height is the vertical space

        // Assigns the data to a hierarchy using parent-child relationships
        let root = d3.hierarchy(data, d => Object.keys(d).length > 1 ? Object.keys(d).map(key => ({ [key]: d[key] })) : null);
        root = treemap(root);

        // Create links between nodes
        const link = svg.selectAll(".link")
        .data(root.descendants().slice(1))
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d => {
          return "M" + d.x + "," + d.y
            + "C" + d.x + "," + (d.y + d.parent.y) / 2
            + " " + d.parent.x + "," + (d.y + d.parent.y) / 2
            + " " + d.parent.x + "," + d.parent.y;
        })
        .style("fill", "none")
        .style("stroke", "#555")
        .style("stroke-width", "2px");

        // Create nodes
        const node = svg.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
        .attr("transform", d => "translate(" + d.x + "," + d.y + ")");

        // Add circles to the nodes
        node.append("circle")
        .attr("r", 10)
        .style("fill", d => d.children ? "#555" : "#999");

        // Add labels to the nodes
        node.append("text")
        .attr("dy", ".35em")
        .attr("y", d => d.children ? -15 : 15)
        .style("text-anchor", "middle")
        .text(d => d.data.name || Object.keys(d.data)[0]);
 }

 function changeD3VAEScatter(className,inputEventMatch){

    d3.selectAll(className)
    .style("opacity", function(d){
        let inputEventMatch2 = inputEventMatch.split("--").join("::").split("_").join(" ");
        //console.log(d.eventTags,"------======------" ,inputEventMatch2);
        if(d.eventTags.includes(inputEventMatch2)){
        return 1
        }else{
        return 0.07
        
        //console.log("---------")
       //console.log(d)
        }
        
    }).style("pointer-events", 
        function(d){
        let inputEventMatch2 = inputEventMatch.split("--").join("::")
        if(d.eventTags.includes(inputEventMatch2)){
            return "all"
        }else{
            return "none"
        }
        }
    )


  }//end of changeD3VAEScatter

 // Function to create a Radial Tree plot
function createRadialTree(data) {

  let container = d3.select("#d3_tree_diagram").node();
        const margin = { top: 20, right: 90, bottom: 30, left: 90 };
        const width = container.getBoundingClientRect().width - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        const radius = Math.min(width, height) / 2;

        d3.select("#d3_tree_diagram").selectAll("*").remove();
        // Append the SVG object to the container
        // Append the SVG object to the body of the page
        const svg = d3.select("#d3_tree_diagram").append("svg") 
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      // Create a radial tree layout and set its size
      const tree = d3.tree()
          .size([2 * Math.PI, radius - 100]);

      // Assigns the data to a hierarchy using parent-child relationships
      const root = d3.hierarchy(data, d => typeof d === 'object' && !Array.isArray(d) ? Object.entries(d).map(([key, value]) => ({ name: key, children: value })) : null);

      // Generate the radial tree
      tree(root);

      // Create links between nodes
      const link = svg.selectAll(".link")
          .data(root.links())
          .enter().append("path")
          .attr("class", "link")
          .attr("d", d3.linkRadial()
              .angle(d => d.x)
              .radius(d => d.y))
          .style("fill", "none")
          .style("stroke", "#555")
          .style("stroke-width", "2px");

      // Create nodes
      const node = svg.selectAll(".node")
          .data(root.descendants())
          .enter().append("g")
          .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
          .attr("transform", d => `
              rotate(${d.x * 180 / Math.PI - 90})
              translate(${d.y},0)
          `);

      // Add circles to the nodes
      node.append("circle")
          .attr("r", 5)
          .style("fill", d => d.children ? "#555" : "#999");

      // Add labels to the nodes
      node.append("text")
          .attr("dy", ".31em")
          .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
          .style("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
          .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
          .text(d => d.data.name)
          .style("font-size", "10px")
          .style("fill", "#333");
    }




 
 function buildHierarchy(tagsArray) {
  let tree = {};

  tagsArray.forEach(tag => {
      let parts = tag.split("::").map(part => part.trim()); // Normalize each part

      let currentLevel = tree;

      parts.forEach((part, index) => {
          // If the part doesn't exist at the current level, create it
          if (!currentLevel[part]) {
              currentLevel[part] = (index === parts.length - 1) ? [] : {}; // Set as array if last part, object otherwise
          } else if (index === parts.length - 1 && !Array.isArray(currentLevel[part])) {
              // Ensure it's an array if it's the last part
              currentLevel[part] = [];
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

function removeArrayDuplicates(node) {
  if (Array.isArray(node)) {
      // Remove duplicates from the array
      return [...new Set(node)];
  } else if (typeof node === 'object' && node !== null) {
      // Recursively process each property
      for (const key in node) {
          node[key] = removeArrayDuplicates(node[key]);
      }
  }
  return node;
}



export function createHierachyPlot(data){
    var eventsArray = data.map(d => d.eventTags).flat();
    /*let eventTagsArray = eventsArray
        .map(item => item.split('/r/n')) // Split each string into an array of event tags
        .flat()                          // Flatten the array of arrays into a single array
        .map(tag => tag.trim())          // Remove any extra whitespace
        .filter((tag, index, self) => self.indexOf(tag) === index) // Remove duplicates
      //  .flatMap(tag => tag.includes(' ') ? tag.split(' ').map(subTag => subTag.trim()) : [tag]); // Split by space if found and trim
    
    console.log(JSON.stringify(eventTagsArray));
    //console.log(eventTagsArray.length);*/

    let eventTagsArray = eventsArray
    .map(item => item.split('/r/n')) // Split each string into an array of event tags
    .flat()                          // Flatten the array of arrays into a single array
    .map(tag => tag.trim())          // Remove any extra whitespace
    .filter(tag => tag !== '');      // Remove empty strings

    // Count occurrences of each tag
    let eventTagsCount1 = eventTagsArray.reduce((acc, tag) => {
        
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
                      
        
    }, {});

    let eventTagsCount2 = eventTagsArray.reduce((acc, tag) => {
        let tag_array = tag.split("::");
        console.log(tag_array.length);
        if(tag_array.length>2){
            let new_Tag = tag_array[0]+"::"+tag_array[1]
            acc[new_Tag] = (acc[new_Tag] || 0) + 1;
            return acc;
        }                 
        
    }, {});

    //console.log(JSON.stringify(eventTagsCount2, null, 2));

    const eventTagsCount = { ...eventTagsCount1, ...eventTagsCount2 };
     
    let hierarchicalTree = buildHierarchy(eventTagsArray);
    // Assuming `hierarchicalData` is your data object
    //const cleanedhierarchicalTree = removeArrayDuplicates(hierarchicalTree);
    //console.log(hierarchicalTree);
    //console.log(JSON.stringify(hierarchicalTree, null, 2));

    // Example usage
    //const data = { /* your JSON object */ };
    const grid = mapToGrid(hierarchicalTree);
    //console.log(grid);
    drawGridDots(grid,eventTagsCount);

    return grid
    //generatePlots(hierarchicalTree["Events"]);
    //createRadialTree(hierarchicalTree["Events"]);

}




 