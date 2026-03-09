//initial settings
const width = 900;
const height = 600;

//creating drawing canvas (svg) inside "map" element so D3 can draw on it
const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Load data
d3.csv("MTA_Subway_Stations.csv").then(function(data) {
  console.log("CSV loaded! Woo!");
  console.log("First row:", data[0]);

  // Convert latitude/longitude to numbers
  data.forEach(d => {
    d.Latitude = +d["GTFS Latitude"];
    d.Longitude = +d["GTFS Longitude"];
  });

  //Tooltip upon hover
const tooltip = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("background", "white")
  .style("padding", "5px")
  .style("border", "1px solid gray")
  .style("border-radius", "4px")
  .style("font-size", "12px")
  .style("visibility", "hidden");

  // Projection centered on NYC
  const projection = d3.geoMercator()
    .center([-73.94, 40.70])   // NYC approx center data points
    .scale(80000)              // zoom in
    .translate([width / 2, height / 2]);


//set up the borough names
const boroughs = [
  {code:"M", name:"Manhattan"},
  {code:"B", name:"Bronx"},
  {code:"Q", name:"Queens"},
  {code:"Bk", name:"Brooklyn"},
  {code:"SI", name:"Staten Island"}
];

//set up the borough colors
const boroughColor = {
  "M": "#e41a1c",   // Manhattan - red
  "B": "#377eb8",   // Bronx - blue
  "Q": "#4daf4a",   // Queens - green
  "Bk": "#984ea3",  // Brooklyn - purple
  "SI": "#ff7f00"    // Staten Island - orange
};

//Color according to Boroughs
svg.selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", d => projection([d.Longitude, d.Latitude])[0])
  .attr("cy", d => projection([d.Longitude, d.Latitude])[1])
  .attr("r", 3)
  .attr("fill", d => boroughColor[d.Borough])
  .attr("opacity", 0.7)

//ADA accessibility
.attr("stroke", d => d.ADA > 0 ? "black" : "none")
.attr("stroke-width", d => d.ADA > 0 ? 2 : 0)

    //mouseover
  .on("mouseover", (event, d) => {
    tooltip
      .style("visibility", "visible")
      .text(d["Stop Name"]);
  })
  .on("mousemove", (event) => {
    tooltip
      .style("top", (event.pageY + 10) + "px")
      .style("left", (event.pageX + 10) + "px");
  })
  .on("mouseout", () => {
    tooltip.style("visibility", "hidden");
  })

//legend for map
const legend = svg.append("g")
  .attr("transform", "translate(20,20)");
  console.log("Stations plotted! Yeehaw!");

//draw the legend
legend.selectAll("rect")
  .data(boroughs)
  .enter()
  .append("rect")
  .attr("x", 0)
  .attr("y", (d,i) => i * 20)
  .attr("width", 12)
  .attr("height", 12)
  .attr("fill", d => boroughColor[d.code]);

legend.selectAll("text")
  .data(boroughs)
  .enter()
  .append("text")
  .attr("x", 18)
  .attr("y", (d,i) => i * 20 + 10)
  .text(d => d.name)
  .attr("font-size", "12px");

  });