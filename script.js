const width = 900;
const height = 600;

const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

d3.csv("MTA_Subway_Stations.csv").then(function(data) {

  console.log(data); // check if data loads
  console.log("CSV loaded!");

});