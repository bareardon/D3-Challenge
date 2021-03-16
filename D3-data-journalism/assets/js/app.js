function makeResponsive() {

  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("#scatter").select("svg");
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // Step 1: Set up our chart
  var svgWidth = 960;
  var svgHeight = 500;

  var margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Step 2: Create an SVG wrapper,append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Step 3: Import data from the csv file
  d3.csv("./assets/data/data.csv").then(function (healthData) {

    // Step 4: Parse the data
    healthData.forEach(function (data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
    });

    // Step 5: Create scale functions
    var xLinearScale = d3.scaleLinear()
      .domain([0, (d3.max(healthData, d => d.poverty) + 5)])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([0, (d3.max(healthData, d => d.healthcare) + 2)])
      .range([height, 0]);

    // Step 6: Create axis fuctions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 7: Append axes to the chart
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 8: Create circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(healthData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", "15")
      .attr("fill", "blue")
      .attr("opacity", ".5");

    // Step 9: Initialize the tool tip
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function (d) {
        return (`State: ${d.state}<br> Poverty %: ${d.poverty} <br>Healthcare ${d.healchare}`);
      });

    // Step 10: Create tooltip in the chart
    chartGroup.call(toolTip);

    // Step 11: Create event listeners to display and hide the tooltip
    circlesGroup.on("mouseover", function (data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function (data, index) {
        toolTip.hide(data);
      });

    // Step 12: Add abbreviations 
    textGroup = chartGroup.append("g")
      .style("font-size", "12px")
      .selectAll("text")
      .data(healthData)
      .enter()
      .append("text")
      .text(function (data) {
        return data.abbr
      })
      .attr("x", function (data) {
        return xLinearScale(data.poverty);
      })
      .attr("y", function (data) {
        return yLinearScale(data.healthcare);
      })
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .attr("font-size", "12px")
      .style("font-weight", "bold")
      .attr("alignment-baseline", "central");

    // Step 13: Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("In Poverty (%)");
  }).catch(function (error) {
    console.log(error);

  });
}
// Call main function
makeResponsive();

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
