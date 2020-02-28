let months = ["January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]

days = d3.range(1, 32),

    years = [2012, 2013, 2014]

margin = {
    top: 90,
    right: 60,
    bottom: 140,
    left: 75
};

width = Math.max(Math.min(window.innerWidth, 1000), 500) - margin.left - margin.right;
gridSize = Math.floor(width / days.length);
height = gridSize * months.length;


var maingroup = d3.select("body>#cont1>#visu2")
    .append("svg")
    .attr("class", "svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var monthLabels = maingroup.selectAll(".monthLabel")
    .data(months)
    .enter().append("text")
    .text(function(d) { return d; })
    .attr("x", 10) // bouger labels des mois
    .attr("y", function(d, i) { return (i + 1) * gridSize; })
    .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
    .attr("class", function(d, i) { return ((i >= 0 && i <= 4) ? "monthLabel axis-days" : "monthLabel"); })
    .style("text-anchor", "end");

var timeLabels = maingroup.selectAll(".timeLabel")
    .data(days)
    .enter().append("text")
    .text(function(d) { return d; })
    .attr("x", function(d, i) { return (i + 1) * gridSize; })
    .attr("y", 20)
    .attr("transform", "translate(" + gridSize / 2 + ", -6)")
    .attr("class", function(d, i) { return ((i >= 9 && i <= 19) ? "timeLabel axis-worktime" : "timeLabel"); })
    .style("text-anchor", "middle");

var tooltip = d3.select("body").append("div")
    .attr("class", "hidden tooltip")

// data path

path = "https://raw.githubusercontent.com/lctdulac/dataviz-d3/master/data/conso_by_day_total.csv";

// slider object

var slider = document.getElementById("myRange");
var output = document.getElementById("demo");

// Initialization

switchPower();

// buttons

function switchPower() {

    bool = false

    output.innerHTML = slider.value; // Display the default slider value
    d3.selectAll("g.legendWrapper").transition().duration(100).remove();
    d3.selectAll("text.subtitle").transition().duration(10).remove();
    d3.selectAll("rect.colored").transition().duration(10).remove();

    initialize_graph_and_scales(2014, CO2 = false)
    updateGrid(slider.value, CO2 = false)

}

function switchCO2() {

    bool = true

    output.innerHTML = slider.value; // Display the default slider value
    d3.selectAll("g.legendWrapper").transition().duration(100).remove();
    d3.selectAll("text.subtitle").transition().duration(10).remove();
    d3.selectAll("rect.colored").transition().duration(10).remove();

    initialize_graph_and_scales(2014, CO2 = true)
    updateGrid(slider.value, CO2 = true)

}


// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {

    console.log("slider input")
    output.innerHTML = this.value;
    d3.selectAll("text.subtitle").transition().duration(10).remove();
    d3.selectAll("rect.colored").transition().duration(10).remove();
    // d3.selectAll("g.legendWrapper").transition().duration(100).remove(); // keep the same scale
    updateGrid(this.value, CO2 = bool);
}


function initialize_graph_and_scales(chosen_year, C02) {

    d3.csv(path, (data) => {

        data.forEach(function(d) {
            if (CO2) { d.cons = +d.CO2 } else { d.cons = +d.Consommation };
            d.CO2 = +d.CO2
            d.day = +d.Jour;
            d.month = +d.Mois;
            d.year = +d.Année;
        });

        console.log("avant")
        console.log(data)

        // filter data
        console.log("Année choisie: " + chosen_year)

        data = data.filter(function(d) { return d.year == chosen_year; })

        console.log("apres")
        console.log(data)

        colorScale = d3.scaleLinear() // !
            .domain([0, d3.max(data, function(d) { return d.cons; }) / 2, d3.max(data, function(d) { return d.cons; })])
            .range(["#fdf6c8", "#fdcfaa", "#bc2f19"]);

        colorScaleCO2 = d3.scaleLinear() // !
            .domain([0, d3.max(data, function(d) { return d.CO2; }) / 2, d3.max(data, function(d) { return d.CO2; })])
            .range(["#a4e109", "#7cb704", "#4a750f"]);

        if (CO2) {
            heatMap = maingroup.selectAll(".day")
                .data(data)
                .enter().append("rect").attr("class", "colored")
                .attr("x", function(d) { return d.day * gridSize; })
                .attr("y", function(d) { return d.month * gridSize; })
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("stroke", "white")
                .style("stroke-opacity", 0.6)
                .style("fill", function(d) { return colorScaleCO2(d.cons); })
                .on("mousemove", mousemove)
                .on("mouseout", mouseout)
                .on("mouseover", mouseover)
        } else {
            heatMap = maingroup.selectAll(".day")
                .data(data)
                .enter().append("rect").attr("class", "colored")
                .attr("x", function(d) { return d.day * gridSize; })
                .attr("y", function(d) { return d.month * gridSize; })
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("stroke", "white")
                .style("stroke-opacity", 0.6)
                .style("fill", function(d) { return colorScale(d.cons); })
                .on("mousemove", mousemove)
                .on("mouseout", mouseout)
                .on("mouseover", mouseover)
        }


        consoScale = d3.scaleLinear() // !
            .domain([0, d3.max(data, function(d) { return d.cons; })])
            .range([0, width])

        consoScaleCO2 = d3.scaleLinear() // !
            .domain([0, d3.max(data, function(d) { return d.CO2; })])
            .range([0, width])

        numStops = 3;
        consoPoint = [0, d3.max(data, function(d) { return d.cons; }) / 2, d3.max(data, function(d) { return d.cons; })];

        if (CO2) {
            maingroup.append("defs")
                .append("linearGradient")
                .attr("id", "legend-traffic-co2")
                .attr("x1", "0%").attr("y1", "0%")
                .attr("x2", "100%").attr("y2", "0%")
                .selectAll("stop")
                .data(d3.range(numStops))
                .enter().append("stop")
                .attr("offset", function(d, i) {
                    return consoScaleCO2(consoPoint[i]) / width;
                })
                .attr("stop-color", function(d, i) {
                    return colorScaleCO2(consoPoint[i]);
                });
        } else {
            maingroup.append("defs")
                .append("linearGradient")
                .attr("id", "legend-traffic")
                .attr("x1", "0%").attr("y1", "0%")
                .attr("x2", "100%").attr("y2", "0%")
                .selectAll("stop")
                .data(d3.range(numStops))
                .enter().append("stop")
                .attr("offset", function(d, i) {
                    return consoScale(consoPoint[i]) / width;
                })
                .attr("stop-color", function(d, i) {
                    return colorScale(consoPoint[i]);
                });
        }

        var legendWidth = Math.min(width * 0.8, 400);

        var legendsvg = maingroup.append("g") // groupe principal
            .attr("class", "legendWrapper")
            .attr("transform", "translate(" + (width / 2) + "," + (gridSize * months.length + 80) + ")");



        if (CO2) {

            legendsvg.append("rect") // rectangle avec gradient
                .attr("class", "legendRect")
                .attr("x", -legendWidth / 2)
                .attr("y", 0)
                .attr("width", legendWidth)
                .attr("height", 10)
                .style("fill", "url(#legend-traffic-co2)");


            legendsvg.append("text") // légende
                .attr("class", "legendTitle")
                .attr("x", 0)
                .attr("y", 50)
                .style("text-anchor", "middle")
                .text("Daily emissions (tons of CO2)");
        } else {

            legendsvg.append("rect") // rectangle avec gradient
                .attr("class", "legendRect")
                .attr("x", -legendWidth / 2)
                .attr("y", 0)
                .attr("width", legendWidth)
                .attr("height", 10)
                .style("fill", "url(#legend-traffic)");


            legendsvg.append("text") // légende
                .attr("class", "legendTitle")
                .attr("x", 0)
                .attr("y", 50)
                .style("text-anchor", "middle")
                .text("Daily consumption (MWh)");
        }

        if (CO2) {
            var xScale = d3.scaleLinear() // scale pour x-axis
                .range([-legendWidth / 2, legendWidth / 2])
                .domain([0, d3.max(data, function(d) { return d.CO2; })]);
        } else {
            var xScale = d3.scaleLinear() // scale pour x-axis
                .range([-legendWidth / 2, legendWidth / 2])
                .domain([0, d3.max(data, function(d) { return d.cons; })]);
        }

        legendsvg.append("g") // x axis
            .attr("class", "axis")
            .attr("transform", "translate(0," + (10) + ")")
            .call(d3.axisBottom(xScale).ticks(5));
    })

}


function updateGrid(chosen_year, CO2) {

    d3.csv(path, (data) => {

        data.forEach(function(d) {
            if (CO2) { d.cons = +d.CO2 } else { d.cons = +d.Consommation };
            d.day = +d.Jour;
            d.month = +d.Mois;
            d.year = +d.Année;
        });

        console.log("avant")
        console.log(data)

        // filter data
        console.log("Année choisie: " + chosen_year)

        data = data.filter(function(d) { return d.year == chosen_year; })

        console.log("apres")
        console.log(data)

        if (CO2) {
            maingroup.append("text")
                .attr("class", "subtitle")
                .attr("x", width / 2)
                .attr("y", -40)
                .style("text-anchor", "middle")
                .style("font-weight", "bold")
                .text("This year total - " + numberWithCommas(d3.sum(data, function(d) { return d.cons })) + " tons of CO2");
        } else {
            maingroup.append("text")
                .attr("class", "subtitle")
                .attr("x", width / 2)
                .attr("y", -40)
                .style("text-anchor", "middle")
                .style("font-weight", "bold")
                .text("This year total - " + numberWithCommas(d3.sum(data, function(d) { return d.cons })) + " MWh");
        };


        var heatMap = maingroup.selectAll(".day")
            .data(data)
            .enter().append("rect").attr("class", "colored")
            .attr("x", function(d) { return d.day * gridSize; })
            .attr("y", function(d) { return d.month * gridSize; })
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("stroke", "white")
            .style("stroke-opacity", 0.6)
            .style("fill", function(d) { if (CO2) { return colorScaleCO2(d.cons); } else { return colorScale(d.cons) } })
            .on("mousemove", mousemove)
            .on("mouseout", mouseout)
            .on("mouseover", mouseover)

    })


}


function mousemove(d) {
    var mouse = d3.mouse(this);
    tooltip
        .attr("style", "left:" + (mouse[0] + 150) + "px; top:" + (mouse[1] + 680) + "px")
}


function mouseout(d) {
    tooltip.classed("hidden", true)
    d3.select(this)
        .transition()
        .duration(500)
        .style("opacity", 1)
}

function mouseover(d) {

    if (CO2) {
        var s = d3.select(this);
        s
            .transition()
            .duration(100)
            .style("opacity", 0.5)
        tooltip
            .classed("hidden", false)
            .html(d.day + "/" + d.month + "/" + d.year + " - <b>" + numberWithCommas(d.cons) + " tons of CO2 </b>")
    } else {
        var s = d3.select(this);
        s
            .transition()
            .duration(100)
            .style("opacity", 0.5)
        tooltip
            .classed("hidden", false)
            .html(d.day + "/" + d.month + "/" + d.year + " - <b>" + numberWithCommas(d.cons) + " MWh </b>")
    }

}


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}