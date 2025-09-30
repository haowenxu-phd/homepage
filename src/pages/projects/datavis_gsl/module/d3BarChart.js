import * as d3 from 'd3v4';

export function d3BarChartPlot(input_string_array,LatentVecExtent) {
    //console.log(input_string);
    // Load the data
    let container = d3.select("#d3_latent_vector_bar").node();


    
    //console.log(data)
    // Set the dimensions and margins of the graph
    var margin = { top: 20, right: 30, bottom: 40, left: 30 },
        width = container.getBoundingClientRect().width - margin.left - margin.right,
        height = 180 - margin.top - margin.bottom;



    d3.select("#d3_latent_vector_bar").selectAll("*").remove();
    // Append the SVG object to the container
    var svg = d3.select("#d3_latent_vector_bar").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        let input_string = input_string_array[0];  
        let data = input_string.split(",").map(Number); // Ensure data is converted to numbers

        let input_string2 = input_string_array[1];  

        //console.log(input_string_array,input_string)

        var x = d3.scaleBand()
            .domain(data.map((d, i) => i))
            .range([0, width])
            .padding(0.1);
        //Math.max(

        var y = d3.scaleLinear()
            //.domain([d3.min(data) < 0 ? d3.min(data) : 0, d3.max(data)]) // Include zero in the domain
            .domain([LatentVecExtent[0], LatentVecExtent[1]]) // Include zero in the domain
            .nice()
            .range([height, 0]);

    drawBars(svg, input_string2, x, y, "bar_p");
    drawBars(svg, input_string, x, y, "bar");
    
    

function drawBars (svg, input_string, x, y, type){
        // Set the scales
        let data = input_string.split(",").map(Number); // Ensure data is converted to numbers
        //console.log("ddddd",data);
        // Append the rectangles for the bar chart
        svg.selectAll("."+type)
    .data(data)
    .enter().append("rect")
        .attr("class", type)
        .attr("x", (d, i) => x(i))
        .attr("width", x.bandwidth())
        .attr("y", d => d >= 0 ? y(d) : y(0)) // Adjust for positive/negative
        .attr("height", d => Math.abs(y(d) - y(0))) // Calculate height correctly for negative values
        .style("stroke", function(d) {
            if (type === 'bar') {
                return "none";
            }
            if (type === 'bar_p') {
                //return d >= 0 ? "#00008B" : "#8B0000";
                //return d >= 0 ? "green" : "orange";
                return "black";
            }
            return "none"; // Default case
        })
        .style("stroke-width", function(d) {
            return "0.5px"
        })
        .style("fill", function(d) {
            if (type === 'bar') {
                return d >= 0 ? "steelblue" : "crimson";
            }
            if (type === 'bar_p') {
                return "none"; // Ensure the bar is not filled
                //return d >= 0 ? "green" : "orange";
            }
            return "gray"; // Default case for unexpected type values
        });


}
    

    // Add the X Axis
    svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
        .tickValues(x.domain().filter((d, i) => i % 10 === 0)) // Show every 10th tick
    );

    // Add the Y Axis
    svg.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y));
}
