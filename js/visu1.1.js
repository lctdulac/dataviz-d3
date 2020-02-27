var margin = { top: 20, right: 100, bottom: 50, left: 60 },
    width = 900 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var y = d3.scaleLinear()
    .rangeRound([height, 0])
    .nice();

var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1)
    .align(0.1)

var z = d3.scaleOrdinal(d3.schemeCategory20)


// Date format https://bl.ocks.org/zanarmstrong/ca0adb7e426c12c06a95
//var parseTime  = d3.timeParse("%d/%m/%Y")
var parseTime = d3.timeParse("%H:%M:%S")

//var formatTime = d3.timeFormat("%d-%m")
//var formatTime = d3.timeFormat("%d")
var formatTime = d3.timeFormat("%H")




data = 'https://raw.githubusercontent.com/Matperrin-ds/Dataviz/master/data_RTE_5.csv'

data_nonuke = 'https://raw.githubusercontent.com/Matperrin-ds/Dataviz/master/data_RTE_5_nonuke.csv'



d3.csv(data, function(error, raw) {

    console.log(raw)

    var symbols = [];
    var data = []

    // Data pre-processing
    raw.forEach(function(d, i) {

        if (symbols.indexOf(d.symbol) < 0) {
            symbols.push(d.symbol)
            data[symbols.indexOf(d.symbol)] = [];
        }

        // String to INT     
        d.value = +d.consumption;

        // Parsing time
        d.date = parseTime(d.date)
        data[symbols.indexOf(d.symbol)].push(d);
    });

    var data_nest = d3.nest()
        .key(function(d) { return formatTime(d.date); })

        .key(function(d) { return d.symbol; })
        .rollup(function(v) { return d3.sum(v, function(d) { return d.consumption; }); })
        .entries(raw);

    var hours = data_nest.map(function(d) { return d.key; })

    var data_stack = []


    symbols_no_tot = symbols

    data_nest.forEach(function(d, i) {
        d.values = d.values.map(function(e) { return e.value; })
        var t = {}
        symbols_no_tot.forEach(function(e, i) {
            t[e] = d.values[i]
        })
        t.year = d.key;
        data_stack.push(t)
    })


    symbols_no_tot = symbols.slice(0, -1)

    var layers = d3.stack().keys(symbols_no_tot)(data_stack);

    var max = d3.max(layers[layers.length - 1], function(d) { return d[1]; });

    y.domain([0, max]);
    x.domain(hours);


    var svg = d3.select("body>#cont1>#visu11").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g").selectAll("g")
        .data(layers)
        .enter().append("g")
        .style("fill", function(d) { return z(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("x", function(d, i) { return x(d.data.year); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width", x.bandwidth())
        .on("mouseover", function(d, i) {
            d3.selectAll("rect")
                .style("opacity", 1)
            d3.select(this).style("opacity", .7)
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", function(d) {
            d3.selectAll("rect")
                .style("opacity", 1)
        })

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (0) + ", 0)")
        .call(d3.axisLeft().scale(y))

    var colors = ["b33040", "#d25c4d", "#f2b447", "#d9d574"]

    var legend = svg.selectAll(".legend")
        .data(layers)
        .enter().append("g")
        .attr("class", "legend")
        //.attr('transform', (d,i) => `translate(${-750 +i * 105},${height + 30})`);
        .attr("transform", function(d, i) { return "translate(10," + i * 19 + ")"; })
    //.attr("transform", function(d, i) { return "translate("+(-1)*i + i * 19 + ", 250)"; })

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) { return z(d.key) });

    legend.append("text")
        .attr("x", width + 5)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d, i) {
            return symbols[i]
        });

})

var tooltip = d3.select("body").append("div")
    .attr("class", "hidden tooltip")

function mouseover(d) {
    console.log(d)
    let sum = 0;
    let cat = ""
    let value = 0
    let total = d.data.Total
    Object.keys(d.data).forEach((key) => {
        if (key != 'Date' && key != 'Total' && key != 'year') {
            sum += d.data[key]
            if (sum == d[1]) {
                if (cat != 'Solaire' && d.data[key] != 0) {
                    cat = key
                    value = d.data[key]
                }
            }
        }

    });

    var s = d3.select(this);
    s
        .transition()
        .duration(1)
        .style("opacity", 0.5)
    tooltip
        .classed("hidden", false)
        .html("<b>" + cat + " : " + Math.round(value) + "</b>" + "<br>" +
            Math.round(value / total * 100) + "% du total produit")
}



function mousemove(d) {
    var mouse = d3.mouse(this);
    tooltip
        .attr("style", "left:" + (620) + "px; top:" + (730) + "px")
}
