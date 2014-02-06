var scale = 250,
    iconSize = "72",
    iconMargins = 3,
    projection = d3.geo.mercator().translate([0, 0]),
    path = d3.geo.path().projection(projection),
    fillColor = "#636363",
    borderColor = "#000000",
    borderWidth = "1",
    worldRegion = "Europe",
    tooltip = d3.select("body").append("div").attr("class", "tooltip");

var vectorSave = d3.select("button#vectorSave"),
    rasterSave = d3.select("button#rasterSave");

var iconSizeCtrl = d3.select("input[name=iconSize]"),
    iconMarginsCtrl = d3.select("input[name=iconMargins]"),
    iconColorCtrl = d3.select("input[name=fillColor]"),
    outlineColorCtrl = d3.select("input[name=strokeColor]"),
    outlineWidthCtrl = d3.select("input[name=strokeWidth]"),
    iconsFilterCtrl = d3.select("select[name=regions]"),
    generateStart = d3.select("button#generateIcons");

    vectorSave.on("click", function() {
      var icons = d3.select("#vectorPreview").selectAll("svg");
      icons.each(saveAsSVG);
    });

    rasterSave.on("click", function() {
      var icons = d3.select("#rasterPreview").selectAll("canvas");
      icons.each(saveAsPNG);
    });

    iconSizeCtrl.on("change", function() {
      iconSize = this.value;
    });

    iconMarginsCtrl.on("change", function() {
      iconMargins = this.value;
    });

    iconColorCtrl.on("change", function() {
      fillColor = this.value;
    });

    outlineColorCtrl.on("change", function() {
      borderColor = this.value;
    });

    outlineWidthCtrl.on("change", function() {
      borderWidth = this.value;
    });

    iconsFilterCtrl.on("change", function() {
      worldRegion = this.value;
    });

queue()
  .defer(d3.json, "data/world-110m-topo.json")
  .await(generator);


function generator(error, world) {
  //Vector icons
  generateVector(world);

  //Rasterise icons
  var icons = d3.select("#vectorPreview").selectAll("svg");
  icons.each(generateRaster);

  generateStart.on("click", function() {
    deleteObjects("svg");
    deleteObjects("canvas");
    generateVector(world);
    var icons = d3.select("#vectorPreview").selectAll("svg");
    icons.each(generateRaster);
  });
          
};

function generateVector(world) {
  var svg = d3.select("#vectorPreview").selectAll("svg")
      .data(topojson.feature(world, world.objects.countries).features
        .filter(function(d) {return worldRegion == "All" ? true : (d.properties.continent == worldRegion);}))
    .enter().append("svg")
      .each(function(d) {
        switch (d.id) {
          case "RUS": var projection = d3.geo.albers().rotate([-105, 0]).center([-10, 65]).parallels([52, 64]);
                      path = d3.geo.path().projection(projection);
                      break;
          case "USA": var projection = d3.geo.albersUsa();
                      path = d3.geo.path().projection(projection);
                      break;
          default:    var projection = d3.geo.mercator();
                      path = d3.geo.path().projection(projection);
                      break;
        }
        var svg = d3.select(this),
            bounds = path.bounds(d),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            dmax = Math.max(dx, dy),
            s = 1 / Math.max(dx / (iconSize - 2 * iconMargins), dy / (iconSize - 2 * iconMargins));
        svg 
            .attr("width", iconSize)
            .attr("height", iconSize)
            .attr("overflow", "hidden")
            .attr("id", d.properties.country)
          .append("g")
            .attr("transform", "scale(" + s + ")translate(" + [iconMargins/s + (dmax - dx) * 0.5 - bounds[0][0], iconMargins/s + (dmax - dy) * 0.5 - bounds[0][1]] + ")")
          .append("path")
            .style("fill", fillColor)
            .style("stroke", borderColor)
            .style("stroke-width", borderWidth / s + "px")
            .attr("d", path);
      })
      .sort(function(a, b) { return a.id - b.id; })
      .on("click", saveAsSVG)
      .on("mouseover", function(d, i) {
        var t = tooltip.html("").style("display", "block");
        t.append("span").attr("class", "country").text(d.properties.country);
      })
      .on("mouseout", function() {
        tooltip.style("display", null);
      });
}

function generateRaster(svg) {
  var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

  var svg = d3.select(this),
  id = svg.attr("id");;
  var iconSize = Math.max(svg.attr("width"), svg.attr("height"));

  xmlnsFix(svg);

  var source = (new XMLSerializer()).serializeToString(svg.node());

  var url = window.URL.createObjectURL(new Blob([doctype + source], { "type" : "image\/svg+xml" }));

  var canvas = d3.select("#rasterPreview").append("canvas")
  .attr("overflow", "hidden")
  .attr("id", id + ".png")
  .attr("width", iconSize)
  .attr("height", iconSize);

  
  canvas
    .on("click", saveAsPNG)
    .on("mouseover", function() {
      id = this.id;
      var t = tooltip.html("").style("display", "block");
      t.append("span").attr("class", "country").text((id.split("."))[0]);
    })
    .on("mouseout", function() {
      tooltip.style("display", null);
    });
  
  var context = canvas.node().getContext("2d");

  var image = new Image;
  image.src = url;
  image.onload = function() {
    context.drawImage(image, 0, 0, iconSize, iconSize);
  };

  setTimeout(function() {
      window.URL.revokeObjectURL(url);
    }, 10);
};

function saveAsSVG(svg) {
  var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
      svg = d3.select(this),
      id = svg.attr("id");

  xmlnsFix(svg);
  
  var source = (new XMLSerializer()).serializeToString(svg.node()),
      url = window.URL.createObjectURL(new Blob([doctype + source], { "type" : "image\/svg+xml" }));

  var a = d3.select("body")
        .append('a')
        .attr("class", "mapIcon-generator")
        .attr("download", id + ".svg")
        .attr("href", url)
        .style("display", "none");

  a.node().click();

  setTimeout(function() {
    window.URL.revokeObjectURL(url);
    a.remove();
  }, 100);
};

function saveAsPNG() {
  var a = d3.select("body")
        .append('a')
        .attr("class", "mapIcon-generator")
        .attr("download", this.id)
        .attr("href", this.toDataURL("image/png"))
        .style("display", "none");

  a.node().click();

  setTimeout(function() {
    a.remove();
  }, 100);
};

  function deleteObjects(object) {
    d3.selectAll(object).remove();
  };

function xmlnsFix(svg) {
  // removing attributes so they aren't doubled up
  svg.node().removeAttribute("xmlns");
  svg.node().removeAttribute("xlink");

  // These are needed for for valid SVG 1.1
  if (!svg.node().hasAttributeNS(d3.ns.prefix.xmlns, "xmlns")) {
    svg.node().setAttributeNS(d3.ns.prefix.xmlns, "xmlns", d3.ns.prefix.svg);
  }

  if (!svg.node().hasAttributeNS(d3.ns.prefix.xmlns, "xmlns:xlink")) {
    svg.node().setAttributeNS(d3.ns.prefix.xmlns, "xmlns:xlink", d3.ns.prefix.xlink);
  }
};