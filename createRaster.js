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
 */

/*jslint browser: true, unparam: true, white: true */

// UTILITY METHODS ----------------------------------
Object.prototype.method = function (name, func) {
	"use strict";
    this.prototype[name] = func;
    return this;
};
 
HTMLElement.method('fire', function(evt) {
	"use strict";
	var fireOnThis = this, evObj;
	if (document.createEvent) {
		evObj = document.createEvent('MouseEvents');
		evObj.initEvent(evt, true, false);
		fireOnThis.dispatchEvent(evObj);
	} else if (document.createEventObject) { // IE
		evObj = document.createEventObject();
		fireOnThis.fireEvent('on' + evt, evObj);
	}
});

// function fireEvent(obj, evt) {
// "use strict";
// var fireOnThis = obj, evObj;
// if (document.createEvent) {
// evObj = document.createEvent('MouseEvents');
// evObj.initEvent(evt, true, false);
// fireOnThis.dispatchEvent(evObj);
// } else if (document.createEventObject) { // IE
// evObj = document.createEventObject();
// fireOnThis.fireEvent('on' + evt, evObj);
// }
// }



// GEGrids Namespace ----------------------------------
var GEGrids = (function() {
	"use strict";

	/*
	 * Controls Closure Interface for the user to set the option of Google
	 * Earth, the parameters of the grid being drawn and the ASCII output, and
	 * handles updating the position display.
	 */
	var controls = (function() {
		
		var options = {},
			grid_params = {},
			nodata = {};		
		
	        return {		
				setOptions : function(opts) {
					options = opts;
				},
				getOptions : function() {
				    return options;	
				},
				setGridParams : function() {
					grid_params.UR_lat = Number(document.getElementById('startURLat').value);
					grid_params.UR_lng = Number(document.getElementById('startURLng').value);
					grid_params.cell_size = Number(document.getElementById('cellSize').value);
					grid_params.altitude = Number(document.getElementById('startAlt').value);
					grid_params.num_lat_cells = Number(document.getElementById('numLat').value);
					grid_params.num_lng_cells = Number(document.getElementById('numLng').value);
				},
				getGridParams : function() {
					return grid_params;
				},
				setNodata : function() {
		        	nodata.checked = document.getElementById('nodata-box').checked;
		            nodata.value = Number(document.getElementById('nodata').value);
		        },
				nodataChecked : function() {
					return nodata.checked;
				},
				nodataValue : function() {
					return nodata.value;
				},
		        updatePosition : function(lat, lng) {
					document.getElementById('latPos').innerHTML = lat;
					document.getElementById('lngPos').innerHTML = lng;
				}
	        };

	}()),
	
	/*
	 * googleEarth Closure Initializes Google Earth and provides an easier
	 * interface for the rest of the program to interact with elements on the
	 * map.
	 */
	googleEarth = (function() {
		
		var ge, ge_options, ge_navigation,
			grid = {};
		
		// START: Initialize Google Earth -----------------------------
		google.load("earth", "1");
		
		function initCallback(instance) {
		    ge = instance;
		    ge_options = ge.getOptions();
			ge_navigation = ge.getNavigationControl();
		    ge.getWindow().setVisibility(true);
	
		    // add some layers
		    ge.getLayerRoot().enableLayerById(ge.LAYER_BORDERS, true);
		    ge.getLayerRoot().enableLayerById(ge.LAYER_ROADS, true);
		    ge.getLayerRoot().enableLayerById(ge.LAYER_TERRAIN, true);
		    ge.getLayerRoot().enableLayerById(ge.LAYER_TREES, true);
		    ge.getOptions().setStatusBarVisibility(true);
		    
		    document.getElementById('installed-plugin-version').innerHTML = ge.getPluginVersion().toString();
		}
		
		function failureCallback(errorCode) {
		    document.getElementById('map3d').innerHTM = errorCode;
		}
		
		// END: Initialize Google Earth ---------------------------------
		
		function setOptions() {
			
			ge_options.setStatusBarVisibility(user_options.status_bar);
			ge_options.setGridVisibility(user_options.lat_lng_grid);
			ge_options.setOverviewMapVisibility(user_options.overview_map);
			ge_options.setScaleLegendVisibility(user_options.scale_legend);
			
			if (user_options.nav_control) {
				ge_navigation.setVisibility(ge.VISIBILITY_SHOW);
            } else {
            	ge_navigation.setVisibility(ge.VISIBILITY_HIDE);
            }
		}
		
		return {
			init : function() {
				google.earth.createInstance('map3d', initCallback, failureCallback);
			},
			updateOptions : function() {
				
				var user_options = controls.getOptions();
				
				setOptions(user_options);
				
				controls.setNodata();
			},
			makeGrid : function() {
				
			}
		};
		
// B) Google Earth Closure
//
// 1) Data
// a) Grid Object
// 1. ID String
// a. color String
// b. value Int
//
// 2) Interface
// a) updateOptions Function
// a) makeGrid Function
// b) clearGrid Function
// c) changeValue(ID) Function
// d) downloadKML Function
		
	}());
	
	/*
	 * GUI & Event Listeners
	 * 
	 */
	(function(){
		var i = 0,
		    upOpts = document.getElementsByClassName('updateOptions'),
		    newOpts = controls.getOptions();

		document.addEventListener('DOMContentLoaded', function () {
		    google.setOnLoadCallback(googleEarth.init);
		});
		
	    for (i = 0; i <  upOpts.length; i++) {
	    	upOpts[i].addEventListener('click', function (e) {
	        	var newOpts = {
	        	    status_bar : document.getElementById('statusbar').checked,
	        	    nav_control : document.getElementById('nav').checked,
	        	    lat_lng_grid : document.getElementById('LL').checked,
	        	    overview_map : document.getElementById('overview').checked,
	        	    scale_legend : document.getElementById('scaleLegend').checked,
	        	    guide_grids : document.getElementById('guideGrid').checked
	        	};
		        googleEarth.updateOptions(newOpts);
	        });
	    }
	}());
	
}());