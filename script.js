// map size
const width = 900;
const height = 600;

// charts size
const margin = { top: 20, right: 20, bottom: 40, left: 40 };

// get actual container width
const containerWidth = document.getElementById("adaChart").clientWidth;
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
  .attr("width", barWidth + margin.left + margin.right)
  .attr("height", barHeight + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);
const structureSvg = d3.select("#structureChart")
  .append("svg")
  .attr("width", barWidth + margin.left + margin.right)
  .attr("height", barHeight + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

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

//mouseover events
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

// click event for station info panel
.on("click", (event, d) => {

  //Prevent background reset click from firing
  event.stopPropagation();

  // 1. Info panel on click
  d3.select("#stationInfo")
    .style("display", "block")
    .html(`
      <h3>${d["Stop Name"]}</h3>
      <p><b>Borough:</b> ${d.Borough}</p>
      <p><b>Routes:</b> ${d["Daytime Routes"]}</p>
      <p><b>Structure:</b> ${d.Structure}</p>
      <p><b>ADA Accessible:</b> ${d.ADA === "1" ? "Yes" : "No"}</p>
    `);

  // 2. Highlight selected station + fade others (with animation)
  svg.selectAll("circle")
    .transition()
    .duration(400)
    .attr("opacity", station =>
      station["Stop Name"] === d["Stop Name"] ? 1 : 0.15
    )
    .attr("r", station =>
      station["Stop Name"] === d["Stop Name"] ? 6 : 3
    );

});
//reset faded stations on blank clicks
svg.on("click", () => {
  svg.selectAll("circle")
    .transition()
    .duration(400)
    .attr("opacity", 0.7)
    .attr("r", 3);

  d3.select("#stationInfo").style("display", "none");
});

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
// STRUCTURE TYPE DATA
// --------------------

function drawStructureChart(filteredData) {

  // 1️⃣ Remove any previous SVG in this div
  d3.select("#structureChart").selectAll("*").remove();

  // 2️⃣ Compute summary counts and sort descending
  const structureSummary = d3.rollups(
    filteredData,
    v => v.length,
    d => d.Structure
  )
  .map(([structure, count]) => ({ structure, count }))
  .sort((a, b) => b.count - a.count);

  // 3️⃣ Create SVG
  const svg2 = d3.select("#structureChart")
    .append("svg")
    .attr("width", barWidth)
    .attr("height", barHeight);

  // 4️⃣ Scales
  const x = d3.scaleBand()
    .domain(structureSummary.map(d => d.structure))
    .range([0, barWidth])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(structureSummary, d => d.count)])
    .range([barHeight - 30, 0]);  // leave space for x-axis labels

  // 5️⃣ Draw bars
  svg2.selectAll("rect")
    .data(structureSummary)
    .enter()
    .append("rect")
    .attr("x", d => x(d.structure))
    .attr("y", d => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", d => barHeight - 30 - y(d.count))
    .attr("fill", "#69b3a2");

  // 6️⃣ X-axis
  svg2.append("g")
    .attr("transform", `translate(0, ${barHeight - 30})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-30)")
    .style("text-anchor", "end");

  // 7️⃣ Y-axis
  svg2.append("g")
    .attr("transform", `translate(0,0)`)
    .call(d3.axisLeft(y));
}

console.log("Structure summary:", structureSummary);

const structureSvg = d3.select("#structureChart")
  .append("svg")
  .attr("width", barWidth)
  .attr("height", barHeight);

const xStruct = d3.scaleBand()
  .domain(structureSummary.map(d => d.structure))
  .range([50, 350])
  .padding(0.2);

const yStruct = d3.scaleLinear()
  .domain([0, d3.max(structureSummary, d => d.count)])
  .nice()
  .range([250, 50]);

  //draw bars
  structureSvg.selectAll(".structBar")
  .data(structureSummary)
  .enter()
  .append("rect")
  .attr("class", "structBar")
  .attr("x", d => xStruct(d.structure))
  .attr("y", d => yStruct(d.count))
  .attr("width", xStruct.bandwidth())
  .attr("height", d => 250 - yStruct(d.count))
  .attr("fill", "#1f78b4");  // blue
  structureSummary.sort((a, b) => b.count - a.count);// highest -> lowest

  //axes 
structureSvg.append("g")
  .attr("transform", "translate(0,250)")
  .call(d3.axisBottom(xStruct));

structureSvg.append("g")
  .attr("transform", "translate(50,0)")
  .call(d3.axisLeft(yStruct));
  
  //title
  structureSvg.append("text")
  .attr("x", barWidth / 2)
  .attr("y", 30)
  .attr("text-anchor", "middle")
  .attr("font-weight", "bold")
  .text("Subway Stations by Structure Type");

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

// ADA bars in black
adaSvg.selectAll(".adaBar")
  .data(boroughSummary)
  .enter()
  .append("rect")
  .attr("class","adaBar")
  .attr("x", d => x(d.borough))           // left side
  .attr("y", d => y(d.ADA))
  .attr("width", x.bandwidth()/2)         // half-width
  .attr("height", d => 250 - y(d.ADA))
  .attr("fill","black");

// Non-ADA bars in gray
adaSvg.selectAll(".nonAdaBar")
  .data(boroughSummary)
  .enter()
  .append("rect")
  .attr("class","nonAdaBar")
  .attr("x", d => x(d.borough) + x.bandwidth()/2)   // shift right
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

  //ADA bar graph title
  adaSvg.append("text")
  .attr("x", barWidth/2)
  .attr("y", 30)
  .attr("text-anchor", "middle")
  .attr("font-weight", "bold")
  .text("ADA vs Non-ADA Stations by Borough");
});

  //draw the legend, ADA
const adaLegend = [
  { label: "ADA Accessible", type: "ada" },
  { label: "Not Accessible", type: "nonada" }
];
const legend = adaSvg.append("g")
  .attr("transform", "translate(300,50)");
legend.selectAll("rect")
  .data(adaLegend)
  .enter()
  .append("rect")
  .attr("x", 0)
  .attr("y", (d,i) => i*20)
  .attr("width", 12)
  .attr("height", 12)
  .attr("fill", d => d.color);
legend.selectAll("text")
  .data(adaLegend)
  .enter()
  .append("text")
  .attr("x", 18)
  .attr("y", (d,i) => i*20 + 10)
  .text(d => d.label)
  .attr("font-size", "12px");
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
  .attr("cy", (d,i) => i * 20 + 15)
  .attr("r", 5)
  .attr("fill", "gray")
  .attr("stroke", d => d.type === "ada" ? "black" : "none")
  .attr("stroke-width", d => d.type === "ada" ? 2 : 0);

ada.selectAll(".adaLabel")
  .data(adaLegend)
  .enter()
  .append("text")
  .attr("class", "adaLabel")
  .attr("x", 18)
  .attr("y", (d,i) => i * 20 + 19)//manual adjustment
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

