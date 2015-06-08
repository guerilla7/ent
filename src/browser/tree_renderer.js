var d3 = require("d3"),
    sprintf = require("sprintf-js").sprintf;

var RECTANGLE_WIDTH = 150,
    RECTANGLE_HEIGHT = RECTANGLE_WIDTH / 2,
    MARGIN = 10,
    ROUNDING = 8;

var rotate_format = function (x, y, scale) {
    return sprintf("translate(%s,%s) scale(%s)", x, y, scale);
};

var diagonalCoords = function(d) {
    var point1 = { x: d.source.x, y: (d.source.y + RECTANGLE_HEIGHT) };
    var point4 = { x: d.target.x, y: d.target.y };

    var mid =  (point1.y + point4.y) / 2;

    var point2 = { x: point1.x, y: mid };
    var point3 = { x: point4.x, y: mid };

    return [point1, point2, point3, point4];
};

var diagonal = d3.svg.line()
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; })
    .interpolate("step");

module.exports = function (element) {
    var $element = element;

    this.clear = function () {
        d3.select($element)
          .select("svg").remove();
    };

    this.render = function (root) {
        var parent = $element.parentNode;

        var width = parent.offsetWidth - (2 * MARGIN);
        var height = parent.offsetHeight - (2 * MARGIN);

        this.clear();

        var tree = d3.layout.tree().nodeSize(
            [RECTANGLE_WIDTH + 2 * MARGIN, RECTANGLE_HEIGHT + 2 * MARGIN]);

        var nodes = tree.nodes(root);
        var links = tree.links(nodes);

        var svg = d3.select($element)
                    .append("svg")
                    .attr("xmlns", "http://www.w3.org/2000/svg");

        var graph = svg.attr("width", width)
                       .attr("height", height)
                       .append("g")
                       .attr("transform", "translate(" + width / 2 + ", " + MARGIN + ")");

        svg.call(d3.behavior.zoom().on("zoom", function () {
            var translation = d3.event.translate;
            graph.attr("transform", rotate_format(translation[0], translation[1], d3.event.scale));
        }));

        graph.selectAll("path.link")
            .data(links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", function(d) { return diagonal(diagonalCoords(d)); });

        graph.selectAll("rect.node")
            .data(nodes)
            .enter()
            .append("rect")
            .attr("class", "node")
            .attr("width", RECTANGLE_WIDTH)
            .attr("height", RECTANGLE_HEIGHT)
            .attr("x", function(d) { return d.x - RECTANGLE_HEIGHT; })
            .attr("y", function(d) { return d.y; })
            .attr("rx", ROUNDING)
            .attr("ry", ROUNDING);

        graph.selectAll("text.node")
            .data(nodes)
            .enter()
            .append("text")
            .attr("class", "node")
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y + (RECTANGLE_HEIGHT / 2) + 3; })
            .attr("text-anchor", "middle")
            .text(function(d) { return d.name; });
    };
};