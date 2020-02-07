var margin = {top: 50, right: 50, bottom: 50, left: 50};

var width = 800 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
	.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

console.log("aaa")

var parseDate = d3.timeParse("%j/%m/%Y")
var parseTime = d3.timeParse("%H:%M")
var displayHour = d3.timeFormat("%H:%M")
var displayDate = d3.timeFormat("%Y")
var getYear = d3.timeFormat("%Y")
var getMonth = d3.timeFormat("%B") 

d3.csv('dataviz-d3/data/data2.csv', (data)=> { 
//       console.log(data.columns)
  data.forEach(d => {
    d.Consommation = +d.Consommation
    d.Date = parseDate(d.Date)
  })
  data_j1 = Object.entries(data).slice(0,96).map(entry => entry[1]); //Sélectionne les 96 premières lignes, ie les données du premier jour
  console.log(data_j1)
  data_j1.forEach(d => {
    d.Heures = parseTime(d.Heures)
  })
  
  var x = d3.scaleTime()
      .domain(d3.extent(data_j1, function(d) { return d.Heures; }))
      .range([0, width])

  var y = d3.scaleLinear()
      .domain([d3.min(data_j1, function(d) { return d.Consommation; }), 
               d3.max(data_j1, function(d) { return d.Consommation; })])
      .range([height, 0])

  var line = d3.line()
  .curve(d3.curveMonotoneX)
  .x(function(d, i) {  return x(d.Heures); })
  .y(function(d, i)  {  return y(d.Consommation); })

  svg.selectAll("path").data([data_j1]).enter()
    .append("path")
    .style("fill", "none")
    .style("stroke", "black")
    .attr("d", line);
  
   var xAxis = d3.axisBottom()
  	.scale(x)
		.ticks(8);

  var yAxis = d3.axisLeft()
      .scale(y)
      .ticks(5);
  
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  
svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);
  
//Titre 
  
  svg.append("text")
    .attr("x", (width / 2))             
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle") 
		.style("font-family","Helvetica")
    .style("font-size", "16px") 
    .style("font-weight", 700)  
    .text("Évolution de la consommation le 1er Décembre 2019");
})
    
    
    
