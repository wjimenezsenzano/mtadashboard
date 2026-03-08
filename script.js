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

  // Projection centered on NYC
  const projection = d3.geoMercator()
    .center([-73.94, 40.70])   // NYC approx center data points
    .scale(80000)              // zoom in
    .translate([width / 2, height / 2]);

//set up the borough colors
    const boroughColor = {
  "M": "#1f77b4",   // Manhattan
  "B": "#ff7f0e",   // Bronx
  "Q": "#2ca02c",   // Queens
  "Bk": "#d62728",  // Brooklyn
  "S": "#9467bd"    // Staten Island
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
  .attr("opacity", 0.7);

  console.log("Stations plotted! Yeehaw!");
});