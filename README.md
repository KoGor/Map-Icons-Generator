Map Icons Generator (MIG)
=========================

MIG is simple tool for generating icons (both vector and raster) based on cartographic data. It is quite flexible, you can change color, lines width, margins and of course size of icons. As far as it based on GeoData ([TopoJSON](https://github.com/mbostock/topojson/wiki)) you can easily change projection and it's parameters or filter regions by geo conditions. And you can feed to it any map: world map, country map with administrative borders or even your town map with districts borders.

## How to use
By default MIG generates icons for 174 world countries, GeoData is 1:110m [natural earth data](http://www.naturalearthdata.com/downloads/). If it's just what you want you can change some general parameters directly in the code or with help of GUI on [demopage](http://kogor.github.io//Map-Icons-Generator/).

If you want more - you can create another input GeoData file and change couple of corresponding code lines. All is quite easy. First of all you have to create [TopoJSON](https://github.com/mbostock/topojson/wiki) file. Make it with help of [Command-line TopoJSON](https://github.com/mbostock/topojson/wiki/Command-Line-Reference) application. If you don't have proper data for naming icons inside TopoJSON file - use external .csv or .tsv file. So now you have new input file(s), so update paths for them in the code:
```js
.defer(d3.json, "data/TopoJSON_file.json")
.defer(d3.tsv, "data/external_file_for_names.tsv")
```
Next step is to change feature name according to your new TopoJSON file:
```js
.data(topojson.feature(world, world.objects.YourNewFeatureName).features
```
That's all. Now you should be able to generate icons from other GeoData.

## Advanced adjustments
Sometimes it is better to use not standard projection, in these cases you can use one of [avaliable projections](https://github.com/mbostock/d3/wiki/Geo-Projections) or even create your own. So feel free to experiment.

## Further improvements
Add ability for line simplification and quantization as soon as it will be available in [topojson.js](https://github.com/mbostock/topojson). Now you can make it only on the stage of creating TopoJSON file. Improve demopage's GUI, add control for filtering GeoData.

## Thanks
Thanks to [Mike Bostock](http://bost.ocks.org/mike/) for great tool &mdash; [D3.js](http://d3js.org/) and to [Jason Davies](http://www.jasondavies.com/) for inspiring example &mdash; [Countries by area](http://www.jasondavies.com/maps/countries-by-area/).
