const width = 900;
const height = 600;

const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Load CSV
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
    .center([-73.94, 40.70])   // NYC approx center
    .scale(80000)              // zoom
    .translate([width / 2, height / 2]);

  // Draw stations as blue circles
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => projection([d.Longitude, d.Latitude])[0])
    .attr("cy", d => projection([d.Longitude, d.Latitude])[1])
    .attr("r", 3)
    .attr("fill", "steelblue")
    .attr("opacity", 0.6);

  console.log("Stations plotted! Yeehaw!");
});