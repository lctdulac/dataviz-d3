// choose path

path =
  "https://raw.githubusercontent.com/lctdulac/dataviz-d3/master/data/data2014.csv";

draw_graph(path);

$('input[type="radio"]').on("click change", function() {
  if (document.getElementById("b1").checked) {
    path =
      "https://raw.githubusercontent.com/lctdulac/dataviz-d3/master/data/data2014.csv";
  } else {
    path =
      "https://raw.githubusercontent.com/lctdulac/dataviz-d3/master/data/data2014_noNuclear.csv";
  }
  
  draw_graph(path);
});

function draw_graph(path) {
  d3.select("svg").remove();
  const margin = { top: 50, right: 50, bottom: 50, left: 50 },
  width =
    Math.max(Math.min(window.innerWidth, 1000), 500) -
    margin.left -
    margin.right,
  height =
    Math.max(Math.min(window.innerWidth, 800), 500) -
    margin.top -
    margin.bottom,
  center_width = width / 2 + margin.left,
  center_height = height / 2 + margin.top;

const parseTime = d3.timeParse("%d/%m/%Y");
const dateFormat = d3.timeFormat("%d/%m/%Y");
const displayDate = d3.timeFormat("%b");
const outerRadius = Math.min(width, height) / 2.2;
const innerRadius = 150;


var tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "hidden tooltip");

var svg = d3
  .select("body>#cont1>#visu3")
  .append("svg")
  .attr("class", "svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  // .style("background-color", color.svg)
  .append("g")
  .attr("transform", "translate(" + center_width + "," + center_height + ")")
  .style("width", "100%")
  .style("height", "auto")
  .style("font", "10px sans-serif");

  d3.csv(path, (error, data) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Data loaded");
      data.forEach(function(d) {
        d.Date = parseTime(d.Date);
        d.Total = +d.Total;
      });
    }
    var energyCat = data.columns.slice(1, 8);
    // console.log(displayDate(data[0].Date))

    data.forEach(function(d) {
      energyCat.forEach(c => {
        d[c] = +d[c];
      });
    });

    var x = d3
      .scaleBand()
      .domain(data.map(d => d.Date))
      .range([0, 2 * Math.PI])
      .align(0);

    var y_scale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.Total)])
      .range([innerRadius * innerRadius, outerRadius * outerRadius]);

    function y(d) {
      return Object.assign(Math.sqrt(y_scale(d)), y);
      //    			return Math.sqrt(y_scale(d))
    }

    var z = d3
      .scaleOrdinal()
      .domain(energyCat)
      .range([
        "#98abc5",
        "#8a89a6",
        "#7b6888",
        "#6b486b",
        "#a05d56",
        "#d0743c",
        "#ff8c00"
      ]);

    var arc = d3
      .arc()
      .innerRadius(d => y(d[0]))
      .outerRadius(d => y(d[1]))
      .startAngle(d => x(d.data.Date))
      .endAngle(d => x(d.data.Date) + x.bandwidth())
      .padAngle(0.01)
      .padRadius(innerRadius);

    svg
      .append("g")
      .selectAll("g")
      .data(d3.stack().keys(energyCat)(data))
      .enter()
      .append("g")
      .attr("fill", d => z(d.key))
      .selectAll("path")
      .data(d => d)
      .enter()
      .append("path")
      .attr("d", arc)
      .on('mousemove', function(d) {
        console.log(d.data.Fioul)
                  var mouse = d3.mouse(svg.node()).map(function(d) {
                      return parseInt(d);
                  });
                  tooltip.classed('hidden', false)
                      .attr('style', 'left:' + (mouse[0] + 15) +
                              'px; top:' + (mouse[1] - 35) + 'px')
                      .html(`${d.data.Fioul} : ${d.data.Fioul}`);
              })
              .on('mouseout', function() {
                  tooltip.classed('hidden', true);
              });

    //Légende

    svg
      .append("g")
      .selectAll("g")
      .data(data.columns.slice(1,-1).reverse())
      .enter()
      .append("g")
      .attr(
        "transform",
        (d, i) => `translate(-40,${(i - (data.columns.length - 1) / 2) * 20})`
      )
      .call(g =>
        g
          .append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", z)
      )
      .call(g =>
        g
          .append("text")
          .attr("x", 24)
          .attr("y", 9)
          .attr("dy", "0.35em")
          .text(d => d)
      );

    //X axis

    svg
      .append("g")
      .attr("text-anchor", "middle")
      .call(g =>
        g
          .selectAll("g")
          .data(data)
          .enter()
          .append("g")
          .attr(
            "transform",
            d => `
      rotate(${((x(d.Date) + x.bandwidth() / 2) * 180) / Math.PI - 90})
      translate(${innerRadius},0)
    `
          )
          .call(g =>
            g
              .append("line")
              .attr("x2", -5)
              .attr("stroke", "#000")
          )
          .call(g =>
            g
              .append("text")
              .attr("transform", d =>
                (x(d.Date) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) <
                Math.PI
                  ? "rotate(90)translate(0,16)"
                  : "rotate(-90)translate(0,-9)"
              )
              .text(d => displayDate(d.Date))
          )
      );

    //Y axis

    svg
      .append("g")
      .attr("text-anchor", "middle")
      .call(g =>
        g
          .append("text")
          .attr("y", d => -y(y_scale.ticks(5).pop()))
          .attr("dy", "-1em")
          .text("Energie produite en MW")
          .attr("font-size", "25px")
      )
      .call(g =>
        g
          .selectAll("g")
          .data(y_scale.ticks(5).slice(1))
          .enter()
          .append("g")
          .attr("fill", "none")
          .call(g =>
            g
              .append("circle")
              .attr("stroke", "#000")
              .attr("stroke-opacity", 0.5)
              .attr("r", y)
          )
          .call(g =>
            g
              .append("text")
              .attr("y", d => -y(d))
              .attr("dy", "0.35em")
              .attr("stroke", "#fff")
              .attr("stroke-width", 5)
              .text(y_scale.tickFormat(5, "s"))
              .clone(true)
              .attr("fill", "#000")
              .attr("stroke", "none")
          )
      );
  });
}
