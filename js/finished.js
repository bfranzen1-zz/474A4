'use strict';

(function() {

  let data = ""; // keep data in global scope
  let svgContainer = ""; // keep SVG reference in global scope
  let width = 1400;
  let height = 700;

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("data/Admission_Predict.csv")
      .then((csvData) => makeHistogram(csvData));
  }


    function makeHistogram(csvData) {
        data = csvData;

        // get TOEFL Scores
        let toeflScores = data.map((row) => parseInt(row["TOEFL Score"]))

        // get min/max of TOEFL scores
        let limits = MinMaxOf(toeflScores);

        let axes = makeAxes(limits);
        
        var hist = d3.histogram()
            .value((d) => d)
            .domain(axes.xScale.domain()) // domain to use for x-axis
            .thresholds(15); // number of x-axis ticks

        var bins = hist(toeflScores);
        axes.yScale.domain([(d3.max(bins, function(d) {return d.length;})) + 10, 0]); // re-scale to leave room at top of graph

        // append the bar rectangles to the svg element
        svgContainer.selectAll("rect")
            .data(bins)
            .enter()
            .append("rect")
                .attr("class", "bar")
                // re-position bars to fit axes
                .attr("x", 50)
                .attr("y", 0)
                .attr("transform", function(d) {
                    return "translate(" + axes.xScale(d.x0) + "," + axes.yScale(d.length) + ")"; })
                .attr("width", function(d) { return axes.xScale(d.x1) - axes.xScale(d.x0) -1 ; })
                .attr("height", function(d) { return height - axes.yScale(d.length) - 100; });

        // append x-axis
        svgContainer.append("g")
            .attr('transform', 'translate(50, 600)')
            .attr("class", "x axis")
            .call(axes.x);
        
        // append y-axis
        svgContainer.append("g")
            .attr('transform', 'translate(100, 0)')
            .call(axes.y);

        // text label for the x axis
        svgContainer.append("text")   
            .attr("y", height - 25)
            .attr("x", width / 2)
            .style("text-anchor", "middle")
            .style("font-family", "Tableau Light, Tableau, Arial, sans-serif")
            .text("TOEFL Score(bin)");
        
        // text label for the y axis
        svgContainer.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 50)
            .attr("x", - (height / 2))
            .style("text-anchor", "middle")
            .style("font-family", "Tableau Light, Tableau, Arial, sans-serif")
            .text("Count of TOEFL Score"); 

        // text label for the title
        svgContainer.append("text")
            .attr("y", 25)
            .attr("x", width / 2)
            .style("text-anchor", "middle")
            .style("font-size", "25px")
            .style("font-family", "Tableau Light, Tableau, Arial, sans-serif")
            .text("TOEFL Score Distribution"); 
    }

  // MinMaxOf returns the rounded min and max value of the input data 
  function MinMaxOf(data) {
    // get min/max gre scores
    let min = d3.min(data);
    let max = d3.max(data);

    // return formatted min/max data as an object
    return {
      min : min,
      max : max
    }
  }

  function makeAxes(limits) {
    let xScale = d3.scaleLinear()
        .domain([limits.min - 2, limits.max + 5]) // give domain buffer room
        .range([50, 1250]);

    let yScale = d3.scaleLinear()
        .domain([100, 0])
        .range([50, 600]);

    var x = d3.axisBottom()
        .scale(xScale).ticks(20);

    var y = d3.axisLeft()
        .scale(yScale)
        .ticks(10);
    
    return {
        xScale : xScale,
        yScale : yScale,
        x : x,
        y : y
    }
  }

})();
