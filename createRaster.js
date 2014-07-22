/* Copyright info: 

Andrew Stanish 
2014
andybp85 at gmail
Version beta2.0.3.1
Source maintained at https://github.com/andybp85/GERasterCreator/

This file is part of GE Raster Creator. 

GE Raster Creator is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

GE Raster Creator is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with GE Raster Creator.  If not, see <http://www.gnu.org/licenses/>.



I) Utility Functions
  A) fireEvent Function

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
*/

// UTILITY FUNCTIONS ----------------------------------
function fireEvent(obj, evt) {
    var fireOnThis = obj;
    if (document.createEvent) {
        var evObj = document.createEvent('MouseEvents');
        evObj.initEvent(evt, true, false);
        fireOnThis.dispatchEvent(evObj);
    } else if (document.createEventObject) { //IE
        var evObj = document.createEventObject();
        fireOnThis.fireEvent('on' + evt, evObj);
    }
}
 
// GEGrids Namespace ----------------------------------
var GEGrids = (function() {
   var private_var;

   function private_function() {
     //code
   }
})()