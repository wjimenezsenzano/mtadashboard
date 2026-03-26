// map size
const width = 900;
const height = 600;

// charts size
const margin = { top: 40, right: 20, bottom: 50, left: 60 };

// get actual container width
const containerWidth = document.getElementById("adaChart").clientWidth;
const barWidth = 400;
const barHeight = 300;

//creating drawing canvas (svg) inside "map" element so D3 can draw on it
const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

//for later abbreviation reference
const boroughFullNames = {
  "M": "Manhattan",
  "Bk": "Brooklyn",
  "Bx": "Bronx",
  "Q": "Queens",
  "SI": "Staten Island"
};
// load data
d3.csv("MTA_Subway_Stations.csv").then(function(data) {

  console.log("CSV loaded! Woo!");
  console.log("First row:", data[0]);

  // initial full dataset render
  drawAdaChart(data); 
  drawStructureChart(data);

  // store globally for filtering and interactions later
  window.fullData = data;      // 

  // convert latitude/longitude to numbers
  data.forEach(d => {
    d.Latitude = +d["GTFS Latitude"];
    d.Longitude = +d["GTFS Longitude"];
  });

//color circles according to borough
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

  // info panel on click
  d3.select("#stationInfo")
    .style("display", "block")
    .html(`
      <h3>${d["Stop Name"]}</h3>
      <p><b>Borough:</b> ${d.Borough}</p>
      <p><b>Routes:</b> ${d["Daytime Routes"]}</p>
      <p><b>Structure:</b> ${d.Structure}</p>
      <p><b>ADA Accessible:</b> ${d.ADA === "1" ? "Yes" : "No"}</p>
    `);

  // highlight selected station and fade others (with animation)
  svg.selectAll("circle")
    .transition()
    .duration(400)
    .attr("opacity", station =>
      station["Stop Name"] === d["Stop Name"] ? 1 : 0.15
    )
    .attr("r", station =>
      station["Stop Name"] === d["Stop Name"] ? 6 : 3
    );
    // Highlight bars in Structure chart, orange
      d3.select("#structureChart").selectAll(".structBar")
        .attr("stroke", bar => bar.structure === d.Structure ? "orange" : "none")
        .attr("stroke-width", bar => bar.structure === d.Structure ? 3 : 0);

      // Highlight ADA bar for the borough, orange
  d3.select("#adaChart").selectAll(".adaBar, .nonAdaBar")
    .attr("stroke", function(bar) {
      // select correct bar set and correct borough
      if (d.ADA === "1") return d3.select(this).classed("adaBar") && bar.borough === d.Borough ? "orange" : "none";
      else return d3.select(this).classed("nonAdaBar") && bar.borough === d.Borough ? "orange" : "none";
    })
    .attr("stroke-width", function(bar) {
      if (d.ADA === "1") return d3.select(this).classed("adaBar") && bar.borough === d.Borough ? 3 : 0;
      else return d3.select(this).classed("nonAdaBar") && bar.borough === d.Borough ? 3 : 0;
    });
});
});
// --------------------
// MAP DATA
// --------------------
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
//reset faded stations on blank clicks
svg.on("click", () => {
  svg.selectAll("circle")
    .transition()
    .duration(400)
    .attr("opacity", 0.7)
    .attr("r", 3);
  // reset Structure bars
  d3.select("#structureChart").selectAll("rect")
    .attr("stroke", "none")
    .attr("stroke-width", 0);

  // reset ADA bars
  d3.select("#adaChart").selectAll(".adaBar, .nonAdaBar")
    .attr("stroke", "none")
    .attr("stroke-width", 0);
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
// FUNCTIONS FOR BAR CHARTS
// --------------------

function drawStructureChart(filteredData) {
  // clear previous chart
  d3.select("#structureChart").html("");

  // compute summary counts and sort descending
  const rolled = d3.rollups(
    filteredData,
    v => v.length,
    d => d.Structure
  );

  const structureSummary = rolled
    .map(([structure, count]) => ({ structure, count }))
    .sort((a, b) => b.count - a.count);

  // create SVG
  const svg = d3.select("#structureChart")
    .append("svg")
    .attr("width", barWidth + margin.left + margin.right)
    .attr("height", barHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // scales
  const x = d3.scaleBand()
    .domain(structureSummary.map(d => d.structure))
    .range([0, barWidth])
    .padding(0.2);
  const y = d3.scaleLinear()
    .domain([0, d3.max(structureSummary, d => d.count)])
    .range([barHeight, 0]);

  // draw bars
  svg.selectAll(".structBar")
    .data(structureSummary)
    .enter()
    .append("rect")
    .attr("class", "structBar")
    .attr("x", d => x(d.structure))
    .attr("y", d => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", d => barHeight - y(d.count))
    .attr("fill", "#1f78b4");

  // axes
  svg.append("g")
    .attr("transform", `translate(0, ${barHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-30)")
    .style("text-anchor", "end");

  svg.append("g")
    .call(d3.axisLeft(y));

  // title
  svg.append("text")
    .attr("x", barWidth / 2)
    .attr("y", -margin.top / 2)  // above chart
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .attr("font-size", "16px")
    .text("Subway Stations by Structure Type");

    //mouseover events for structure chart
  svg.selectAll("rect")
  .on("mouseover", (event, d) => {
    tooltip
      .style("visibility", "visible")
      .html(`<b>${d.structure}</b><br>Stations: ${d.count}`);
  })
  .on("mousemove", (event) => {
    tooltip
      .style("top", (event.pageY + 10) + "px")
      .style("left", (event.pageX + 10) + "px");
  })
  .on("mouseout", () => {
    tooltip.style("visibility", "hidden");
  });
}

function drawAdaChart(filteredData) {
  // clear chart before redraw
  d3.select("#adaChart").html("");

  const svg = d3.select("#adaChart")
  .append("svg")
  .attr("width", barWidth + margin.left + margin.right)
  .attr("height", barHeight + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

  // --------------------
  // DATA
  // --------------------
  const boroughSummary = d3.rollups(
    filteredData,
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

  // --------------------
  // SCALES
  // --------------------
  const x = d3.scaleBand()
  .domain(boroughSummary.map(d => d.borough))
  .range([50, barWidth - 50])
  .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(boroughSummary, d => d.ADA + d.nonADA)])
    .nice()
    .range([barHeight, 0]);

  // --------------------
  // BARS
  // --------------------

  // ADA (black)
  svg.selectAll(".adaBar")
    .data(boroughSummary)
    .enter()
    .append("rect")
    .attr("class","adaBar")
    .attr("x", d => x(d.borough))
    .attr("y", d => y(d.ADA))
    .attr("width", x.bandwidth()/2)
    .attr("height", d => barHeight - y(d.ADA))
    .attr("fill","black");

  // non-ADA (gray)
  svg.selectAll(".nonAdaBar")
    .data(boroughSummary)
    .enter()
    .append("rect")
    .attr("class","nonAdaBar")
    .attr("x", d => x(d.borough) + x.bandwidth()/2)
    .attr("y", d => y(d.nonADA))
    .attr("width", x.bandwidth()/2)
    .attr("height", d => barHeight - y(d.nonADA))
    .attr("fill","lightgray");

    //ada mouseover events
svg.selectAll(".adaBar, .nonAdaBar")
  .on("mouseover", (event, d) => {
    const type = d3.select(event.target).classed("adaBar") ? "ADA" : "Non-ADA";
    const count = type === "ADA" ? d.ADA : d.nonADA;
    tooltip
      .style("visibility", "visible")
      .html(`<b>${boroughFullNames[d.borough]}</b><br>${type}: ${count}`);
  })
  .on("mousemove", (event) => {
    tooltip
      .style("top", (event.pageY + 10) + "px")
      .style("left", (event.pageX + 10) + "px");
  })
  .on("mouseout", () => {
    tooltip.style("visibility", "hidden");
  });

  // --------------------
  // AXES
  // --------------------
  svg.append("g")
    .attr("transform", `translate(0, ${barHeight})`)
    .call(d3.axisBottom(x)
            .tickFormat(d => boroughFullName[d] || d)) // map short code to full name
    .selectAll("text")
    .attr("transform", "rotate(-30)")
    .style("text-anchor", "end");

  svg.append("g")
    .call(d3.axisLeft(y));

  // --------------------
  // TITLE
  // --------------------
  svg.append("text")
    .attr("x", barWidth / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .text("ADA vs Non-ADA Stations by Borough");

  // --------------------
  // LEGEND
  // --------------------
  const legendData = [
    { label: "ADA Accessible", color: "black" },
    { label: "Not Accessible", color: "lightgray" }
  ];

  const legend = svg.append("g")
    .attr("transform", `translate(${barWidth - 120},20)`);

  legend.selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d,i) => i * 20)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", d => d.color);

  legend.selectAll("text")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", 18)
    .attr("y", (d,i) => i * 20 + 10)
    .text(d => d.label)
    .attr("font-size", "12px");
}
