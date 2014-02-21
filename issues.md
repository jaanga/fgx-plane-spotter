FGx Plane Spotter Issues & Updates
==================================

Things to remember:

* It's always a good thing to have the JavaScript console open when you run this app.
* You may be the first person in your country to look at this app/ Thus it may take a bit of time for all the caches along the way to load the data. So be patient.
* When things are working well updates take only a second or two.
* After the app has settled down on your machine, then try the permalinks and the other features

## 2014-02-14 ~  ~ FGx Plane Spotter r2.4 ~ Theo

Help menu in wrong place
Need to highlight which callsign has just been clicked

## 2014-02-12 ~ FGx Plane Spotter r2.2 ~ Theo

A number of PNGs over the oceans are yet to exist...
Draggable DIVs have issues being dragged
There is no mechanism to follow an aircraft - apart from clicking on its link
 

## 2014-02-11 ~ FGx Plane Spotter r2.2 ~ Theo

Planes: issues with aircraft altitudes and headings. Planes are probably heading magnetic and so far the app is true only.
Sometimes the ILS cones point downward!?! << 2014-02-14 ~ fixed. It was a degrees to radians thing
Lots of issues with diagrams and going to zoom level 7 and below. Thus mostly turned off for now.
Must work on better formula for controlling the scaling of the elevations.

Coming up: more camera things and more flight status things

* add permalinks to read me

After that: 

* What should a 3D diagram look like?
* Probably need a function that takes lat/Lon, looks at heightmap and returns height.
* Also need much better understanding of de Ferranti HGT files, GDAL etc.
* Need to figure out simple forking that works with GitHub CORS conditions

## 2014-02-10 ~ FGx Plane Spotter r2 ~ Theo

Comments to Yves in email:

And, yes, here are dozens of things broken with this release.

The break in the data in example you show is because the app is only showing 3D data from *one* of de Ferranti's height maps at a time. 
When you go over the edge of the particular height map data the remaining portions are drawn at an elevation of zero. Keep on moving. 
Once the upper left corner finds its way to the next de Ferranti heightmap, things are good again. 
Fixing this issue is going to be fun. When you get to a corner, instead of loading just one 3 MB bitmap file, you may have to load four!?!

And even when you do have the data, when you zoom in close, you see small gaps between tiles. 
This goes all the way to my continued ignorance of how de Ferranti's HGT files are organized through the GDAL conversion process and the JavaScript canvas tag mashup.

Almost all of these matters appear to me to be quite trivial - caused very much by my ignorance and being such a cartography/gdal newb. 
So it's just a question of time before these issues are resolved.

BTW, this release is in the Jaanga project because - as you pointed out - of the GitHub CORS issues. But I believe this only need be temporary. 
I think that there are fairly easy ways of forking projects that may solve these issues. I need to do some experiments to confirm this.

Again thanks for taking the time to have a look and comment,

**

FGx Plane Spotter is an app built upon a viewer [unFlatland]( http://jaanga.github.io/terrain-viewer/un-flatland/index.html ) which reads data from 
[Jaanga Terrain]( [unFlatLand]( http://jaanga.github.io/terrain/ ) and other cartography websites.
 
All the current features and issues of [unFlatLand]( http://jaanga.github.io/terrain-viewer/un-flatland/index.html ) are therefore features and issues with Plane Spotter r2.

A big issue with the current revision of unFlatLand are the edge conditions described in 
[Jaanga Terrain Further Considerations]( http://jaanga.github.io/terrain/readme-reader.html#further-considerations.md).
All these issues appear to be solvable.

Issues pertaining to Plane Spotter r2 Beta include the following:

* What is the angle the ILS cone should make with the ground?
* How to calculate the radius of the base of the ILS cone?
* How to calculate accurately the correct scale for nautical miles - so as to provide a correct length for the ILS beam?
* Ditto the scale of meters so as to provide a correct width of the runways?
* Continuing to improve the accuracy of positioning elements - particularly their elevation

Coming in the upcoming betas:

* <s>Display of FGx Crossfeed aircraft</s>
* <s>Permalinks for the airports</s>
* First person camera
* <s>Div showing all the current craft in service</s>
* <s>Camera on airport control tower</s>
* <s>Zoom level-dependent display of all 34K+ ICOA Objects</s>   

