/* Copyright info: 

Andrew Stanish 
2014
andybp85 at gmail
Version 2.0.3.1
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

*/
//--GLOBALS---------------------------------
var LINE_WIDTH = 0.04479550075655295;

var startCoords = null;
var numLng = null;
var numLat = null;
var cellSize = null;
var noData = {
    "checked": false,
    'val': null
};
var LLCorner = {
    'X': 0,
    'Y': 0
};

var ge = null;
var la = null;

var newCoords = null;
var mbutton = false;
var innerGrid = null;

var startViewChange = {
    'camLatStart': 0,
    'camLngStart': 0,
    'pointLatStart': 0,
    'pointLngStart': 0
};

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

//--GOOGLE-EARTH------------------------------

google.load("earth", "1");

function init() {
    google.earth.createInstance('map3d', initCallback, failureCallback);
}

function initCallback(instance) {
    ge = instance;
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
    alert(errorCode);
}

//--UTILITY-FUNCTIONS----------------------------------

// function convDecToArc(val) {
//     var x = String(val).split(['.']);
//     var out = x[0];
//     out += "\u00B0";
//     var y = String(parseFloat('0.' + x[1]) * 60).split(['.']);
//     out += y[0];
//     out += '\'';
//     out += String(Math.round((parseFloat('0.' + y[1].substring(0,2)) * 60))/100);
//     out += '"';
//     return out;
// }

// var Reflector = function(obj) {

//     this.getProperties = function() {
//         var properties = [];
//         for (var prop in obj) {
//             if (typeof obj[prop] != 'function') {
//                 properties.push(prop);
//             }
//         }
//         return properties;
//     }

//     this.getAllMethods = function() {
//         var methods = [];
//         for (var method in obj) {
//             if (typeof obj[method] == 'function') {
//                 methods.push(method);
//             }
//         }
//         return methods;
//     }
// }

function createArray(length) {
    var arr = Array.apply(null, new Array(length || 0)).map(Number.prototype.valueOf, 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--) arr[length - 1 - i] = createArray.apply(this, args);
    }
    return arr;
}

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
//--FILESYSTEM-------------------------------------
var filesys = {
    fs: null,
    upfile: null,
    download: function (filename, data) {
        var blob = new Blob([data], {
            type: 'text/plain'
        });
        var pom = document.createElement('a');
        pom.setAttribute("href", window.URL.createObjectURL(blob));
        pom.setAttribute('download', filename);
        pom.click();
    },
    uploadRaster: function (evt) {
        var files = evt.target.files; // FileList object

        for (var i = 0, f; f = files[i]; i++) {

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function (theFile) {
                return function (e) {
                    filesys.upfile = e.target.result;
                    var raster = filesys.upfile.split(/\s+/);
                    var i = 0;
                    // capture header information
                    while (isNaN(raster[i]) || isNaN(raster[i + 1])) {
                        switch (raster[i]) {
                        case 'NCOLS':
                            document.getElementById('numLng').value = raster[i + 1];
                            numLng = raster[i + 1];
                            break;
                        case 'NROWS':
                            document.getElementById('numLat').value = raster[i + 1];
                            numLat = raster[i + 1];
                            break;
                        case 'CELLSIZE':
                            document.getElementById('cellSize').value = raster[i + 1];
                            cellSize = raster[i + 1];
                            break;
                        case 'NODATA_VALUE':
                            document.getElementById('nodata').value = raster[i + 1];
                            break;
                        }
                        i++;
                    }
                    var i = 0;
                    while (isNaN(raster[i]) || isNaN(raster[i + 1])) {
                        switch (raster[i]) {
                        case 'XLLCORNER':
                            document.getElementById('startURLng').value = (Number(raster[i + 1]) + (numLng * cellSize));
                            break;
                        case 'YLLCORNER':
                            document.getElementById('startURLat').value = (Number(raster[i + 1]) + (numLat * cellSize));
                            break;
                        }
                        i++;
                    }
                    
                    //get ready to parse
                    var head = i + 1,
                        row = 0,    
                        col = 0,
                        ids = [];
                    
                    //draw a blank map
                    fireEvent(document.getElementById('drawMap'), 'click');
                    
                    //map out ids
                    while (row < numLat) {
                        col = 0;
                        while (col < numLng) {
                            ids.push(( ( numLng - col ) * numLat ) - ( numLat - row ));
                            col++;
                        }
                        row++;
                    }                    
                    
                    // parse raster, click on cells 
                    mbutton = true;
                    
                    for (var i = 0; i < ids.length; i++){
                        
                        var boxOuterGeom = ge.getElementById(ids[i].toString()).getGeometry().getOuterBoundary().getCoordinates().get(0);
                        var boxInnerGeom = ge.getElementById(ids[i].toString()).getGeometry().getInnerBoundaries().getFirstChild().getCoordinates().get(0);
                        
                        var insideBox = {
                        		lat: (boxOuterGeom.getLatitude() + boxInnerGeom.getLatitude()) / 2,
                        		lng: (boxOuterGeom.getLongitude() + boxInnerGeom.getLongitude()) / 2
                        };

                        if ( raster[head+i] == 1 ) {
                            
                            elem = dataset.getBox(insideBox.lat, insideBox.lng );
                            dataset.bCC(elem.latI, elem.lngI, ids[i].toString(), true );

                        } else if ( raster[head+i] == -999 ){
                        	
                        	noData.checked = true;
                        	elem = dataset.getBox(insideBox.lat, insideBox.lng );
                            dataset.bCC(elem.latI, elem.lngI, ids[i].toString(), true );
                            noData.checked = false;
                            
                        }
                    }
                    mbutton = false;
                    
                    dataset.render();
                    alert('File Loaded');
                };
            })(f);

            // Read in the  file as a text string.
            reader.readAsText(f);
        }
    },
    uploadKML: function(evt) {
        var files = evt.target.files; // FileList object

        for (var i = 0, f; f = files[i]; i++) {
        	
        	var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function (theFile) {
                return function (e) {
                	console.log( theFile );
                    filesys.upfile = e.target.result;
                    var kmlObject = ge.parseKml(filesys.upfile);
                    
                    ge.getFeatures().appendChild(kmlObject);
                    
                    alert('File Loaded');
                };

            })(f);

            // Read in the image file as a string.
            reader.readAsText(f);
	  		
        }
    }

};


//	init : function() {
//		window.webkitStorageInfo.requestQuota(PERSISTENT, 1024*1024, function(grantedBytes) {
//			window.requestFileSystem(window.PERSISTENT, grantedBytes, function(fs){
//				filesys.fs  = fs;z
//			}, filesys.errorHandler);
//		}, filesys.errorHandler);
//	},
//	save : function(filename, data) {
//
//	  fs.root.getFile(name, {create: true}, function(fileEntry) {
//
//	    // Create a FileWriter object for our FileEntry (log.txt).
//	    fileEntry.createWriter(function(fileWriter) {
//
//	      fileWriter.onwriteend = function(e) {
//	        console.log('Write completed.');
//	      };
//
//	      fileWriter.onerror = function(e) {
//	        console.log('Write failed: ' + e.toString());
//	      };
//
//	      // Create a new Blob and write to it
//	      var blob = new Blob([ data  ], {type: 'text/plain'});
//
//	      fileWriter.write(blob);
//	    });
//	  });


//		    }, filesys.errorHandler);
//
//		  }, filesys.errorHandler);
//
//		}, this.errorHandler);
//		


//		window.requestFileSystem(window.TEMPORARY, 1024*1024, onInitFs, this.errorHandler);

//		filesys.fs.root.getFile('kml', {}, function(fileEntry) {
//
//		    // Get a File object representing the file,
//		    // then use FileReader to read its contents.
//		    fileEntry.file(function(file) {
//		       var reader = new FileReader();
//
//		       reader.onloadend = function(e) {
//		         var txtArea = document.createElement('textarea');
//		         txtArea.value = this.result;
//		         document.body.appendChild(txtArea);
//		       };
//
//		       reader.readAsText(file);
//		    }, filesys.errorHandler);
//
//		  }, filesys.errorHandler);


//		window.requestFileSystem(window.PERSISTENT, 1024*1024, function(fs){
//			console.log(fs);
//		}, function(e) {
//			console.log(e);
//		});
// 		});
//	},
//	read : function() {
//		fs.root.getFile('data.kml', {}, function(fileEntry) {
//
//		    // Get a File object representing the file,
//		    // then use FileReader to read its contents.
//		    fileEntry.file(function(file) {
//		       var reader = new FileReader();
//
//		       reader.onloadend = function(e) {
//		         //var txtArea = document.createElement('textarea');
//		         console.log( this.result );
//		         //document.body.appendChild(txtArea);
//		       };
//
//		       reader.readAsText(file);
//		    }, filesys.errorHandler);
//
//		  }, filesys.errorHandler);
//	},
//	errorHandler: function(e) {
//	    alert('Error: ' + e.message);
//	},
//	onInitFs : function(filesys) {
//		console.log( filesys );
//	  filesys.root.getFile(this.name, {create: true}, function(fileEntry) {
//	
//		// Create a FileWriter object for our FileEntry (log.txt).
//		fileEntry.createWriter(function(fileWriter) {
//	
//		  fileWriter.onwriteend = function(e) {
//			console.log('Write completed.');
//		  };
//	
//		  fileWriter.onerror = function(e) {
//			console.log('Write failed: ' + e.toString());
//		  };
//	
//		  // Create a new Blob and write it to log.txt.
//		  var blob = new Blob(['Lorem Ipsum'], {type: 'text/plain'});
//	
//		  fileWriter.write(blob);
//	
//		}, this.errorHandler);
//	
//	  }, this.errorHandler);
//	
//	}


//--DATASET-CREATOR----------------------------------
var dataset = {
    rasterMap: {
        LRlngVals: {},
        LRlatVals: {}
    },
    oldID: -1,

    createMap: function () {
        this.grid = createArray(numLat, numLng);
    },

    addLat: function (id, LRlatVal) {
        this.rasterMap.LRlatVals[id] = LRlatVal;
    },
    addLng: function (id, LRlngVal) {
        this.rasterMap.LRlngVals[id] = LRlngVal;
    },

    render: function () {
        var data = 'NCOLS ' + numLng + "\n";
        data += 'NROWS ' + numLat + "\n";
        data += 'XLLCORNER ' + LLCorner.X + "\n";
        data += 'YLLCORNER ' + LLCorner.Y + "\n";
        data += 'CELLSIZE ' + cellSize + "\n";
        data += 'NODATA_VALUE ' + noData.val + "\n\n";

        for (var iLat = 0; iLat < numLat; iLat++) {
            for (var iLng = numLng - 1; iLng >= 0; iLng--) {

                if (iLng != numLng - 1) {
                    data += ' ';
                }
                //data += ((Number(iLng) * numLat ) + Number(iLat)).toString() + ':' + this.grid[iLat][iLng];
                //console.log(iLat,iLng, this.grid[iLat][iLng]);
                data += this.grid[iLat][iLng];
            }
            data += ' ';
        }
        document.getElementById('output').innerHTML = data;
    },

    getBox: function (lat, lng) {
		
        var latI = 0;
		
        while (lat < this.rasterMap.LRlatVals[latI]) {
            latI++;
        }


        var lngI = numLng - 1;

        while (lng > this.rasterMap.LRlngVals[lngI]) {
            lngI--;
        }

        return {
            'latI': latI,
            'lngI': lngI
        };
    },

    boxColorChange : function (lat, lng) {
        if (mbutton) {

            var LL = dataset.getBox(lat, lng);

            var id = ( (Number(LL.lngI) * numLat ) + Number(LL.latI) ).toString() ;
			
            this.bCC(LL.latI, LL.lngI, id);
        }
    },
    bCC : function(latI, lngI, id, fastMode) {
    	
        var placemarkStyle = ge.getElementById(id).getStyleSelector();
        if (this.oldID != id || fastMode) {
            
           //console.log(LL, id );//, ge.getElementById(id).getKml() );
           var retval = 0;
            if (noData.checked) {
            	retval = 1;
                this.grid[latI][lngI] = noData.val;
                placemarkStyle.getLineStyle().getColor().set('ffae33ff');
                placemarkStyle.getPolyStyle().getColor().set('ffae33ff');
            } else if (placemarkStyle.getPolyStyle().getColor().get() == "ff00008b" || placemarkStyle.getPolyStyle().getColor().get() == 'ffae33ff') {
            	retval = 2;
                this.grid[latI][lngI] = 0;
                placemarkStyle.getLineStyle().getColor().set('ffffffff');
                placemarkStyle.getPolyStyle().getColor().set('ffffffff');
            } else {
            	retval = 3;
                this.grid[latI][lngI] = 1;
                placemarkStyle.getLineStyle().getColor().set('ff00008b');
                placemarkStyle.getPolyStyle().getColor().set('ff00008b');
            }
            
            if (! fastMode) this.render();

            this.oldID = parseInt(id);
        }
        ///console.log( latI, lngI, id, this.grid[latI][lngI], retval);
    }
};

//--GRID-FUNCS---------------------------------

function RemoveAllFeatures() { //needs to take out just placemarks
    var features = ge.getFeatures();
    while (features.getLastChild() !== null) {
        features.removeChild(features.getLastChild());
    }
}

function clickInit() {

    google.earth.addEventListener(ge.getWindow(), 'mousedown', function (event) {
        if (event.getTarget().getType() == 'KmlPlacemark' && event.getTarget().getGeometry().getType() == 'KmlPolygon') {
            mbutton = true;
            event.preventDefault();
            dataset.boxColorChange(event.getLatitude(), event.getLongitude());
        }
    });

    google.earth.addEventListener(ge.getGlobe(), 'mousemove', function (event) {
        document.getElementById('latPos').innerHTML = event.getLatitude();
        //$('#latPos').html(event.getLatitude());
        document.getElementById('lngPos').innerHTML = event.getLongitude();
        //$('#lngPos').html(event.getLongitude());
        if (mbutton && event.getTarget().getType() == 'KmlPlacemark' && event.getTarget().getGeometry().getType() == 'KmlPolygon') {
            event.preventDefault();
            dataset.boxColorChange(event.getLatitude(), event.getLongitude());
        }
    });

    google.earth.addEventListener(ge.getWindow(), 'mouseup', function (event) {
        if (mbutton) {
            mbutton = false;
            dataset.oldID = -1;
        }
    });

    google.earth.addEventListener(ge.getView(), 'viewchangebegin', function () {
        if (mbutton) {
            startViewChange.camLatStart = ge.getView().copyAsLookAt(ge.ALTITUDE_ABSOLUTE).getLatitude();
            startViewChange.camLngStart = ge.getView().copyAsLookAt(ge.ALTITUDE_ABSOLUTE).getLongitude();
            startViewChange.pointLatStart = Number($('#latPos').text());
            startViewChange.pointLngStart = Number($('#lngPos').text());
            //console.log(startViewChange);
        }
    });

    google.earth.addEventListener(ge.getView(), 'viewchange', function () {
        if (mbutton) {
            newLat = startViewChange.pointLatStart - (startViewChange.camLatStart - ge.getView().copyAsLookAt(ge.ALTITUDE_ABSOLUTE).getLatitude());
            newLng = startViewChange.pointLngStart - (startViewChange.camLngStart - ge.getView().copyAsLookAt(ge.ALTITUDE_ABSOLUTE).getLongitude());
            //console.log(newLat + "," + newLng);
            dataset.boxColorChange(newLat, newLng);
        }
    });
}

function initGrid() {
    //RemoveAllFeatures();
    // something like ge.getFeatures().removeChild(grid);

    // set the camera view
    var la = ge.createLookAt('');
    la.setLatitude(startCoords.LL.lat);
    la.setLongitude(startCoords.LL.lng);
    la.setRange(5000);
    ge.getView().setAbstractView(la);

    dataset.createMap();

    var grid = ge.createFolder("grid");
    genPolygons(grid);
    // 	for (x = 0; x < dataset.placemarks.length; x++) {
    // 		for (y = 0; y < dataset.placemarks[x].length; y++) {
    // 			grid.getFeatures().appendChild(dataset.placemarks[x][y]);
    // 		}
    // 	}
    ge.getFeatures().appendChild(grid);

    innerGrid = ge.createFolder("innerGrid");

    clickInit();
}

function genPolygons(folder) {

    var id = 0;

    for (var lngI = 0; lngI < numLng; lngI++) {
        makePolygon(0, lngI, folder, id);
        id++;
        dataset.addLng(lngI, newCoords.LR.lng);
        dataset.addLat(0, newCoords.LR.lat);

        for (var latI = 1; latI < numLat; latI++) {
            makePolygon(latI, lngI, folder, id);
            id++;
            LLCorner.X = newCoords.LL.lng;
            LLCorner.Y = newCoords.LL.lat;
            if (lngI === 0) {
                dataset.addLat(latI, newCoords.LR.lat);
            }
        }
    }
    dataset.render();
}

function makePolygon(latI, lngI, folder, id) {

    var placemark = ge.createPlacemark((id).toString());
    var polygon = ge.createPolygon('');

    placemark.setGeometry(polygon);

    newCoords = {
        LL: {
            lat: startCoords.LL.lat + (latI * -cellSize),
            lng: startCoords.LL.lng + (lngI * -cellSize)
        },
        LR: {
            lat: startCoords.LR.lat + (latI * -cellSize),
            lng: startCoords.LR.lng + (lngI * -cellSize)
        },
        UR: {
            lat: startCoords.UR.lat + (latI * -cellSize),
            lng: startCoords.UR.lng + (lngI * -cellSize)
        },
        UL: {
            lat: startCoords.UL.lat + (latI * -cellSize),
            lng: startCoords.UL.lng + (lngI * -cellSize)
        }
    };

    var innerDiff = cellSize * LINE_WIDTH;

    var outer = ge.createLinearRing('');
    outer.getCoordinates().pushLatLngAlt(newCoords.LL.lat, newCoords.LL.lng, (startCoords.LL.alt + 50));
    outer.getCoordinates().pushLatLngAlt(newCoords.LR.lat, newCoords.LR.lng, (startCoords.LR.alt + 50));
    outer.getCoordinates().pushLatLngAlt(newCoords.UR.lat, newCoords.UR.lng, (startCoords.UR.alt + 50));
    outer.getCoordinates().pushLatLngAlt(newCoords.UL.lat, newCoords.UL.lng, (startCoords.UL.alt + 50));
    polygon.setOuterBoundary(outer);

    var inner = ge.createLinearRing('');
    inner.getCoordinates().pushLatLngAlt(newCoords.LL.lat + innerDiff, newCoords.LL.lng + innerDiff, (startCoords.LL.alt + 50));
    inner.getCoordinates().pushLatLngAlt(newCoords.LR.lat + innerDiff, newCoords.LR.lng - innerDiff, (startCoords.LR.alt + 50));
    inner.getCoordinates().pushLatLngAlt(newCoords.UR.lat - innerDiff, newCoords.UR.lng - innerDiff, (startCoords.UR.alt + 50));
    inner.getCoordinates().pushLatLngAlt(newCoords.UL.lat - innerDiff, newCoords.UL.lng + innerDiff, (startCoords.UL.alt + 50));
    polygon.getInnerBoundaries().appendChild(inner);

    if (!placemark.getStyleSelector()) {
        placemark.setStyleSelector(ge.createStyle(''));
    }

    placemark.getStyleSelector().getLineStyle().setWidth(3);
    placemark.getStyleSelector().getLineStyle().getColor().set('ffffffff');
    placemark.getStyleSelector().getPolyStyle().setFill(1);

    folder.getFeatures().appendChild(placemark);
}

function drawInnerLines(folder) {

    var startLat = startCoords.UR.lat,
        startLng = startCoords.UR.lng,
        newLng = 0,
        newLat = 0,
        gridPcnt = 3;

    for (var lngI = 0; lngI < numLng; lngI++) {
        for (var decLngI = 0; decLngI < 1; decLngI += (1 / gridPcnt)) {
            newLng = startLng + ((decLngI + lngI) * -cellSize);
            addLine(startLat, newLng, startLat + (numLng * -cellSize), newLng, startCoords.UR.alt, folder);
        }
    }

    for (var latI = 0; latI < numLat; latI++) {
        for (var decLatI = 0; decLatI < 1; decLatI += (1 / gridPcnt)) {
            newLat = startLat + ((decLatI + latI) * -cellSize);
            addLine(newLat, startLng, newLat, startLng + (numLat * -cellSize), startCoords.UR.alt, folder);
        }
    }
}

function addLine(lat1, lng1, lat2, lng2, alt, folder) {
    
    // Create the placemark
    var lineStringPlacemark = ge.createPlacemark('');

    // Create the LineString
    var lineString = ge.createLineString('');
    lineStringPlacemark.setGeometry(lineString);

    // Create a style and set width and color of line
    lineStringPlacemark.setStyleSelector(ge.createStyle(''));
    var lineStyle = lineStringPlacemark.getStyleSelector().getLineStyle();
    lineStyle.setWidth(5);
    lineStyle.getColor().set('99CCCCCC'); // aabbggrr format


    // Add LineString points
    lineString.getCoordinates().pushLatLngAlt(lat1, lng1, alt);
    lineString.getCoordinates().pushLatLngAlt(lat2, lng2, alt);

    // Add the feature to Earth
    folder.getFeatures().appendChild(lineStringPlacemark);
}

//--CONTROLS----------------------------------

document.addEventListener('DOMContentLoaded', function () {

    google.setOnLoadCallback(init);

    document.getElementById('drawMap').addEventListener('click', function () {
        cellSize = Number(document.getElementById('cellSize').value);

        startCoords = {
            UL: {
                lat: Number(document.getElementById('startURLat').value),
                lng: Number(document.getElementById('startURLng').value) - cellSize,
                alt: Number(document.getElementById('startAlt').value)
            },
            LL: {
                lat: Number(document.getElementById('startURLat').value) - cellSize,
                lng: Number(document.getElementById('startURLng').value) - cellSize,
                alt: Number(document.getElementById('startAlt').value)
            },
            LR: {
                lat: Number(document.getElementById('startURLat').value) - cellSize,
                lng: Number(document.getElementById('startURLng').value),
                alt: Number(document.getElementById('startAlt').value)
            },
            UR: {
                lat: Number(document.getElementById('startURLat').value),
                lng: Number(document.getElementById('startURLng').value),
                alt: Number(document.getElementById('startAlt').value)
            }
        };

        numLng = Number(document.getElementById('numLng').value);
        numLat = Number(document.getElementById('numLat').value);
        noData.val = Number(document.getElementById('nodata').value);

        initGrid();

    });

    var upOpts = document.getElementsByClassName('updateOptions');

    for (var i = 0; i < upOpts.length; ++i) {

        upOpts[i].addEventListener('click', function (e) {

            var options = ge.getOptions();
            options.setStatusBarVisibility(document.getElementById('statusbar').checked);
            options.setGridVisibility(document.getElementById('LL').checked);
            options.setOverviewMapVisibility(document.getElementById('overview').checked);
            options.setScaleLegendVisibility(document.getElementById('scaleLegend').checked);

            if (document.getElementById('nav').checked) {
                ge.getNavigationControl().setVisibility(ge.VISIBILITY_SHOW);
            } else {
                ge.getNavigationControl().setVisibility(ge.VISIBILITY_HIDE);
            }

            noData.checked = document.getElementById('nodata-box').checked;
        });
    }

    document.getElementById('guideGrid').addEventListener('click', function () {

        if (this.checked) {
            drawInnerLines(innerGrid);
            ge.getFeatures().appendChild(innerGrid);
        } else {
            ge.getFeatures().removeChild(innerGrid);
            //innerGrid.release();
        }
    });

    document.getElementById('download').addEventListener('click', function () {
        filesys.download(document.getElementById('filename').value + ".txt", document.getElementById('output').value);
    });

    document.getElementById('downloadKML').addEventListener('click', function () {
        filesys.download(document.getElementById('filename').value + ".kml", ge.getElementById('grid').getKml()); // $('#filename').val() + ".kml", ge.getFeatures().getFirstChild().getKml() );
    });
    document.getElementById('files').addEventListener('change', filesys.uploadRaster, false);
    document.getElementById('kml_files').addEventListener('change', filesys.uploadKML, false);
    
});