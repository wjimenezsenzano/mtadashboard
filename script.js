//initial settings for map
const width = 900;
const height = 600;

//initial settings for bar charts
const barWidth = 400;
const barHeight = 300;

//creating drawing canvas (svg) inside "map" element so D3 can draw on it
const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

//creating drawing canvases for both chart elements so D3 can draw
const adaSvg = d3.select("#adaChart")
  .append("svg")
  .attr("width", barWidth)
  .attr("height", barHeight);
const structureSvg = d3.select("#structureChart")
  .append("svg")
  .attr("width", barWidth)
  .attr("height", barHeight);

// Load data
d3.csv("MTA_Subway_Stations.csv").then(function(data) {
  console.log("CSV loaded! Woo!");
  console.log("First row:", data[0]);
// --------------------
// MAP DATA
// --------------------
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

  // Define projection map centered on NYC
  const projection = d3.geoMercator()
    .center([-73.94, 40.70])   // NYC approx center data points
    .scale(80000)              // zoom in level
    .translate([width / 2, height / 2]);


//set up the borough names
const boroughs = [
  {code:"M", name:"Manhattan"},
  {code:"Bx", name:"Bronx"},
  {code:"Q", name:"Queens"},
  {code:"Bk", name:"Brooklyn"},
  {code:"SI", name:"Staten Island"}
];

//set up the borough colors
const boroughColor = {
  "M": "#e41a1c",   // Manhattan - red
  "Bx": "#377eb8",   // Bronx - blue
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

//ADA accessibility outlines
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

//draw the legend, boroughs
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

// --------------------
// ADA BAR CHART DATA
// --------------------
// get ADA counts by borough
const boroughSummary = d3.rollups(
  data,
  v => ({
    ADA: v.filter(d => d.ADA === "1").length,
    nonADA: v.filter(d => d.ADA === "0").length
  }),
  d => d.Borough
).map(([borough, counts]) => ({
  borough,
  ADA: counts.ADA,
  nonADA: counts.nonADA
}));
const x = d3.scaleBand()//set x-scale for bar
  .domain(boroughSummary.map(d => d.borough))
  .range([50, 350])
  .padding(0.2);

const y = d3.scaleLinear()//set y-scale for bar
  .domain([0, d3.max(boroughSummary, d => d.ADA + d.nonADA)])
  .nice()
  .range([250, 50]);
console.log("Borough ADA summary:", boroughSummary);
  });

  //draw the legend, ADA
  // ADA legend
const adaLegend = [
  {label: "ADA Accessible", stroke: "black"},
  {label: "Not Accessible", stroke: "none"}
];

const ada = svg.append("g")
  .attr("transform", "translate(20,140)");

ada.append("text")
  .text("Accessibility")
  .attr("y", -5)
  .attr("font-weight", "bold");

ada.selectAll("circle")
  .data(adaLegend)
  .enter()
  .append("circle")
  .attr("cx", 6)
  .attr("cy", (d,i) => i * 20+15) //manually fix the legend
  .attr("r", 5)
  .attr("fill", "gray")
  .attr("stroke", d => d.stroke)
  .attr("stroke-width", 2);

ada.selectAll("text")
  .data(adaLegend)
  .enter()
  .append("text")
  .attr("x", 18)
  .attr("y", (d,i) => i * 20 + 19) //manually fix the legend
  .text(d => d.label)
  .attr("font-size", "12px");

  // ADA bars (black)
adaSvg.selectAll(".adaBar")
  .data(boroughSummary)
  .enter()
  .append("rect")
  .attr("class","adaBar")
  .attr("x", d => x(d.borough))
  .attr("y", d => y(d.ADA))
  .attr("width", x.bandwidth()/2)
  .attr("height", d => 250 - y(d.ADA))
  .attr("fill","black");

// Non-ADA bars (gray)
adaSvg.selectAll(".nonAdaBar")
  .data(boroughSummary)
  .enter()
  .append("rect")
  .attr("class","nonAdaBar")
  .attr("x", d => x(d.borough) + x.bandwidth()/2)
  .attr("y", d => y(d.nonADA))
  .attr("width", x.bandwidth()/2)
  .attr("height", d => 250 - y(d.nonADA))
  .attr("fill","lightgray");

  adaSvg.append("g")
  .attr("transform","translate(0,250)")
  .call(d3.axisBottom(x));

adaSvg.append("g")
  .attr("transform","translate(50,0)")
  .call(d3.axisLeft(y));