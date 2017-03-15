var margin = {
      top: 20,
      right: 60,
      bottom: 30,
      left: 40
    };

var width = 600 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

var x = d3.scaleLinear()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

var xAxis = d3.axisBottom(x)
    .tickFormat(function(d) {
      return d + '%';
    });

var yAxis = d3.axisLeft(y);

var svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv('data/oecd_health_data.csv', function(error, data) {
  // Chart code can use data here!
	data.forEach(function(d){
	  d.x = +d['gdp_spending_2014'];
	  d.y = +d['life_exp_2014'];
	});
	x.domain(
	    d3.extent(data, function(d) { return d.x; })
	).nice();

	y.domain(
	    d3.extent(data, function(d) { return d.y; })
	).nice();

svg.append("g")
  .attr("class", "x axis")
  // Translate is an SVG property that helps us move the X axis below the chart.
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis)
.append("text")
  .attr("class", "label")
  .attr("x", width) // width represents the farthest point right on our chart
  .attr("y", -6)
  .style("text-anchor", "end") // Anchoring the text to the end lets us flow it left from that end point.
  .text("GDP health spending");

//Append the y axis to the chart.
svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
.append("text")
  .attr("class", "label")
  .attr("transform", "rotate(-90)") // Rotate is another SVG property.
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("Life expectancy");

svg.selectAll('circle')
    .data(data)
  .enter().append('circle')
    .attr('r', 4)
    .attr('cx', function(d){return x(d.x);})
    .attr('cy', function(d){return y(d.y);});

svg.selectAll('circle')
    .data(data)
    .attr('r', 5)
    .attr('cx', function(d){return x(d.x);})
    .attr('cy', function(d){return y(d.y);});

svg.selectAll('.tip')
    .data(data)
  .enter().append('text')
    .attr('class', 'tip')
    .attr('x', function(d){return x(d.x) + 7;})
    .attr('y', function(d){return y(d.y) + 5;})
    .text(function(d){ return d.cou; });


});

