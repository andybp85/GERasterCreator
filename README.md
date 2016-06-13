GE GRIDS
========

Original Aricle, read for description of funtionality:

[A novel approach to mapping land conversion using Google Earth with an application to East Africa](http://www.sciencedirect.com/science/article/pii/S1364815215001747)

This rewrite implents ES2015 (w/ Babel), Webpack, Sass, Ava for testing, and Flow for type checking.

#### Resources
* [Ava: Futuristic test runner](https://github.com/avajs/ava)
* [React Ava Workshop](https://github.com/kentcdodds/react-ava-workshop/blob/master/INSTRUCTIONS.md)
* [Webpack Module Builder](https://webpack.github.io/docs/usage.html)
* [Sass Basics](http://sass-lang.com/guide)
* [Tutorial – write in ES6 and Sass on the front end with Webpack and Babel](http://tech.90min.com/?p=1340)
* [About Flow](https://flowtype.org/docs/about-flow.html)
* [Getting Started with Flow and Webpack](http://blog.iansinnott.com/getting-started-with-flow-and-webpack/)


Getting Started
---------------

1. clone: `git clone https://github.com/andybp85/GERasterCreator.git`
2. pull maps branch: `git pull origin maps`
3. checkout branch: `git checkout maps`
4. run `npm install` from the root directory.
5. set `NODE_ENV` in your environment and add your google maps api browser key to the apprpriate file in `confg` (see below)
6. run the dev server: `npm run dev`
7. run tests with `npm test`
8. have a look through `package.json` to see what else is going on
9. run typechecking with `flow`


Structure
---------

#### legacy/createRaster-old.js
The original code base

#### legacy/createRaster-maps.js
This I think is basically the original code base with maps basically dropped in to see if it would work.

#### gegrids/
This is the current rewrite


Config
------

Set an env var for the status of the project to 'development' and then put your Google Maps API key in `config/development.js`. You can set the env var just for the dev server command with `NODE_ENV='development' npm run dev`. Config file should look like this:
```
export const GEGRIDS_MAPS_API='yourapikey';

```

Old Comments
---------
```
I) Utility Methods
  A) add method
  B) fire event

II) GEGrids Object

  A) Controls Closure

    1) Data
      a. Options Object
        1. status bar
        2. navigation control
        3. lat/long grid
        4. overview map
        5. scale legend
        3. guide grids
      b. Grid_params Object
        1. UR_lat
        2. UR_lng
        3. cell_size
        4. altitude
        5. num_lat_cells
        6. num_lng_cells
      d. Nodata Object
        1. checked
        2. value
      e. Position Object
        1. lat
        2. lng

    2) Interface
     a. setOptions Function
     b. getOptions Function
     c. setGridParams Function
     d. getGridParams Function
     e. setNodata Function
     f. getNodata Function
     g. setPosition Function
     h. getPosition Function

  B) Google Earth Closure

    1) Data
      a) Grid Object
        1. ID String
          a. color String
          b. value Int

    2) Interface
      a) makeGrid Function
      b) clearGrid Function
      c) changeValue(ID) Function
      d) downloadKML Function

  C) ASCII Raster Closure

    1) Data
      a) ASCIIHead String
      a) ASCIIRaster String

    2) Interface
      a) setASCIIHead Function
      b) makeASCII Function
      c) downloadASCII Function
      d) uploadASCII Function

  D) Event Triggers
    Delegation

```
