//--GLOBALS---------------------------------

var LINE_WIDTH = 0.04479550075655295;

var startCoords = null;
var numLng = null;
var numLat = null;
var cellSize = null;
var noData = { "checked":false,'val':null };
var LLCorner = {'X':0,'Y':0};

var ge = null;
var la = null;

var newCoords = null;
var mbutton = false;

var startViewChange = { 'camLatStart' : 0, 'camLngStart' : 0, 'pointLatStart' : 0, 'pointLngStart' : 0  };

window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

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
	var arr = Array.apply(null, new Array(length || 0)).map(Number.prototype.valueOf,0),
    	i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }
    return arr;
}
//--FILESYSTEM-------------------------------------
var fs = {
	 download: function(filename, text) {
		var pom = document.createElement('a');
		pom.setAttribute('href', 'data:text/plain;charset=us-ascii,' + encodeURIComponent(text));
		pom.setAttribute('download', filename);
		pom.click();
	},
	saveTemp: function() {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024,function(){console.log('success')}, fs.errorHandler);
	},
	errorHandler: function(e) {
	  var msg = '';
	
	  switch (e.code) {
		case FileError.QUOTA_EXCEEDED_ERR:
		  msg = 'QUOTA_EXCEEDED_ERR';
		  break;
		case FileError.NOT_FOUND_ERR:
		  msg = 'NOT_FOUND_ERR';
		  break;
		case FileError.SECURITY_ERR:
		  msg = 'SECURITY_ERR';
		  break;
		case FileError.INVALID_MODIFICATION_ERR:
		  msg = 'INVALID_MODIFICATION_ERR';
		  break;
		case FileError.INVALID_STATE_ERR:
		  msg = 'INVALID_STATE_ERR';
		  break;
		default:
		  msg = 'Unknown Error';
		  break;
	  };
	
	  console.log('Error: ' + msg);
	}
}
//--DATASET-CREATOR----------------------------------
var dataset = {
    rasterMap : {
        LRlngVals : {},
        LRlatVals : {}
    },
    oldID : -1,
	
    createMap : function () {
        this.grid = createArray(numLat,numLng);
    },

    addLat : function(id,LRlatVal){ 
        this.rasterMap.LRlatVals[id] = LRlatVal;
    },
    addLng : function(id,LRlngVal){ 
        this.rasterMap.LRlngVals[id] = LRlngVal;
    },
    
    render : function() {
        var data = 'NCOLS ' + numLng + "\n";
        data += 'NROWS ' + numLat + "\n";
        data += 'XLLCORNER ' + LLCorner.X + "\n";
        data += 'YLLCORNER ' + LLCorner.Y + "\n";
        data += 'CELLSIZE ' + cellSize +  "\n";
        data += 'NODATA_VALUE ' + noData.val +  "\n\n";
         
         for (var iLat  = 0; iLat < numLat; iLat++) {
             for (var iLng = numLng-1; iLng >= 0; iLng--) {
				 
                 if (iLng != numLng-1) {
                     data += ' ';
                 }
                 data += this.grid[iLat][iLng];
             }
             data += '\n';
         }        
        document.getElementById('output').innerHTML = data;
    },
    
    getBox : function (lat,lng) {
        var latI = 0;
        while (lat < this.rasterMap.LRlatVals[latI]) {
            latI++;
        }
		
        var lngI = numLng - 1;
        while (lng > this.rasterMap.LRlngVals[lngI]) {
            lngI--;
        }

        return {'latI' : latI,'lngI' : lngI};
    },

    boxColorChange : function(lat,lng){
        if (mbutton) {

			var LL = dataset.getBox(lat,lng);
			
			//need to change this
			var id = ( (LL.lngI * 10) + LL.latI ).toString();
			
			var placemarkStyle = ge.getElementById(id).getStyleSelector();
			//console.log( this.oldID, parseInt(id) );
			//console.log( ge.getElementById(id).getParentNode().getFeatures().getChildNodes().getLength() );
			if ( this.oldID != id ) {
				console.log( 'change' );
				if (noData.checked) {
					this.grid[LL.latI][LL.lngI] = noData.val;
					//this.placemarks[LL.latI][LL.lngI].getStyleSelector().getLineStyle().getColor().set('ffae33ff');
					// somthing like ge.getfeatures().getSomethingById("#").getStyle...
					//this.placemarks[LL.latI][LL.lngI].getStyleSelector().getPolyStyle().getColor().set('ffae33ff');
					placemarkStyle.getLineStyle().getColor().set('ffae33ff');
					placemarkStyle.getPolyStyle().getColor().set('ffae33ff');
				} else if ( placemarkStyle.getPolyStyle().getColor().get() == "ff00008b" || placemarkStyle.getPolyStyle().getColor().get() == 'ffae33ff') {
					this.grid[LL.latI][LL.lngI] = 0;
					//this.placemarks[LL.latI][LL.lngI].getStyleSelector().getLineStyle().getColor().set('ffffffff');
					//this.placemarks[LL.latI][LL.lngI].getStyleSelector().getPolyStyle().getColor().set('ffffffff');
					placemarkStyle.getLineStyle().getColor().set('ffffffff');
					placemarkStyle.getPolyStyle().getColor().set('ffffffff');
				} else {
					this.grid[LL.latI][LL.lngI] = 1;
					//this.placemarks[LL.latI][LL.lngI].getStyleSelector().getLineStyle().getColor().set('ff00008b');
					//this.placemarks[LL.latI][LL.lngI].getStyleSelector().getPolyStyle().getColor().set('ff00008b');
					placemarkStyle.getLineStyle().getColor().set('ff00008b');
					placemarkStyle.getPolyStyle().getColor().set('ff00008b');
				}        
				
				this.render();
			
				this.oldID = parseInt(id);
			}
        }
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
    
    google.earth.addEventListener(ge.getWindow(), 'mousedown', function(event) {
		if (event.getTarget().getType() == 'KmlPlacemark' && event.getTarget().getGeometry().getType() == 'KmlPolygon') {
			mbutton = true;
			event.preventDefault();
        	dataset.boxColorChange(event.getLatitude(),event.getLongitude());
		}
    });
    
    google.earth.addEventListener(ge.getGlobe(), 'mousemove', function(event) {
		document.getElementById('latPos').innerHTML = event.getLatitude();
        //$('#latPos').html(event.getLatitude());
		document.getElementById('lngPos').innerHTML = event.getLongitude();
        //$('#lngPos').html(event.getLongitude());
		if (mbutton && event.getTarget ().getType() == 'KmlPlacemark' && event.getTarget().getGeometry().getType() == 'KmlPolygon') {
			event.preventDefault();
			dataset.boxColorChange(event.getLatitude(),event.getLongitude());
		}
    });
    
    google.earth.addEventListener(ge.getWindow(), 'mouseup', function(event) {
        if (mbutton) {
            mbutton = false;
			dataset.oldID = -1;
        }
    });
	
	google.earth.addEventListener(ge.getView(), 'viewchangebegin', function(){
		if (mbutton) {
			startViewChange.camLatStart = ge.getView().copyAsLookAt(ge.ALTITUDE_ABSOLUTE).getLatitude();
			startViewChange.camLngStart = ge.getView().copyAsLookAt(ge.ALTITUDE_ABSOLUTE).getLongitude();
			startViewChange.pointLatStart = Number($('#latPos').text());
			startViewChange.pointLngStart = Number($('#lngPos').text());
			//console.log(startViewChange);
		}
	});
	
	google.earth.addEventListener(ge.getView(), 'viewchange', function(){
		if (mbutton) {
 			newLat = startViewChange.pointLatStart - (startViewChange.camLatStart - ge.getView().copyAsLookAt(ge.ALTITUDE_ABSOLUTE).getLatitude());
			newLng = startViewChange.pointLngStart - (startViewChange.camLngStart - ge.getView().copyAsLookAt(ge.ALTITUDE_ABSOLUTE).getLongitude());
			//console.log(newLat + "," + newLng);
			dataset.boxColorChange(newLat,newLng);
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
        
    clickInit();
}

// function genPolygons(folder) {
	
// 	var id = 0;
    
//     for (var latI = 0; latI < numLat; latI++) {
//         makePolygon(0, latI, folder, id);
// 		id++;
// 		if (latI === 0 ) {
// 			dataset.addLat(latI,newCoords.LR.lat);
// 		}
        
//         for (var lngI = 1; lngI < numLng; lngI++) {
//             makePolygon(lngI, latI, folder, id);
// 			id++;
// 			LLCorner.X = newCoords.LL.lng;
//         	LLCorner.Y = newCoords.LL.lat;
			
//             if (latI === lngI) {
// 				dataset.addLat(latI,newCoords.LR.lat);
// 				dataset.addLng(lngI,newCoords.LR.lng);
				
//             }
//         }     
//     }
//     dataset.render();
// }

function genPolygons(folder) {
	
	var id = 0;
	
    for (var lngI = 0; lngI < numLng; lngI++) {
        makePolygon(0, lngI, folder, id);
		id++;
        dataset.addLng(lngI,newCoords.LR.lng);
        dataset.addLat(0,newCoords.LR.lat)
        
        for (var latI = 1; latI < numLat; latI++) {
            makePolygon(latI, lngI, folder, id);
			id++;
			LLCorner.X = newCoords.LL.lng;
        	LLCorner.Y = newCoords.LL.lat;
            if (lngI === 0) {
                dataset.addLat(latI,newCoords.LR.lat);
            }
        }     
    }
    dataset.render();
}

function makePolygon(latI, lngI, folder, id) {

    var placemark = ge.createPlacemark( (id).toString() );
    var polygon = ge.createPolygon('');
	
    placemark.setGeometry(polygon);
    
//     var lngDiff = startCoords.LL.lng - startCoords.LR.lng;
//     var latDiff = startCoords.LR.lat - startCoords.UR.lat;
	
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
    outer.getCoordinates().pushLatLngAlt(newCoords.LL.lat, newCoords.LL.lng, startCoords.LL.alt);
    outer.getCoordinates().pushLatLngAlt(newCoords.LR.lat, newCoords.LR.lng, startCoords.LR.alt);
    outer.getCoordinates().pushLatLngAlt(newCoords.UR.lat, newCoords.UR.lng, startCoords.UR.alt);
    outer.getCoordinates().pushLatLngAlt(newCoords.UL.lat, newCoords.UL.lng, startCoords.UL.alt);
    polygon.setOuterBoundary(outer);

    var inner = ge.createLinearRing('');
    inner.getCoordinates().pushLatLngAlt(newCoords.LL.lat + innerDiff, newCoords.LL.lng + innerDiff, startCoords.LL.alt);
    inner.getCoordinates().pushLatLngAlt(newCoords.LR.lat + innerDiff, newCoords.LR.lng - innerDiff, startCoords.LR.alt);
    inner.getCoordinates().pushLatLngAlt(newCoords.UR.lat - innerDiff, newCoords.UR.lng - innerDiff, startCoords.UR.alt);
    inner.getCoordinates().pushLatLngAlt(newCoords.UL.lat - innerDiff, newCoords.UL.lng + innerDiff, startCoords.UL.alt);
    polygon.getInnerBoundaries().appendChild(inner);

    if (!placemark.getStyleSelector()) {
        placemark.setStyleSelector(ge.createStyle(''));
    }    
	
    placemark.getStyleSelector().getLineStyle().setWidth(3);
    placemark.getStyleSelector().getLineStyle().getColor().set('ffffffff');
    placemark.getStyleSelector().getPolyStyle().setFill(1);
	
	folder.getFeatures().appendChild(placemark);
}

//--CONTROLS----------------------------------

document.addEventListener('DOMContentLoaded',function(){
		
    google.setOnLoadCallback(init);

	document.getElementById('drawMap').addEventListener('click', function() {
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
	
	//console.log( document.getElementsByClassName('updateOptions') );
	var upOpts = document.getElementsByClassName('updateOptions');
	
	for (var i = 0; i < upOpts.length; ++i) {
		
	
		
		upOpts[i].addEventListener('click', function(e) {
			
			var options = ge.getOptions();
			options.setStatusBarVisibility( document.getElementById('#statusbar').checked );
			options.setGridVisibility( document.getElementById('LL').checked );
			options.setOverviewMapVisibility( document.getElementById('overview').checked );
			options.setScaleLegendVisibility( document.getElementById('scaleLegend').checked );
		
			if ( document.getElementById('nav').checked ) {
				ge.getNavigationControl().setVisibility(ge.VISIBILITY_SHOW);
			} else {
				ge.getNavigationControl().setVisibility(ge.VISIBILITY_HIDE);
			}
			
			noData.checked = document.getElementById('nodata-box').checked;
		});
	}


	document.getElementById('download').addEventListener('click', function(){
		fs.download( document.getElementById('filename').value + ".txt", document.getElementById('output').value );
	});
	
	document.getElementById('downloadKML').addEventListener('click', function(){
 		fs.saveTemp();// $('#filename').val() + ".kml", ge.getFeatures().getFirstChild().getKml() );
		//console.log(ge.getFeatures().getFirstChild().getKml());
		
// 		ge.getFeatures().getFirstChild().getKml().toBlob(function(blob) {
// 			saveAs(blob, $('#filename').val() + ".kml");
// 		});
		
// 		var kml = "";
// 		for (var iLat  = 0; iLat < numLat; iLat++) {
//              for (var iLng = numLng-1; iLng >= 0; iLng--) {
//                  if (iLng != numLng-1) {
//                      kml += ' ';
//                  }
//                  kml += dataset.placemarks[iLat][iLng].getKml();
//              }
//              kml += '\n';
//          } 
		 
		// for (var i = 0; i < ge.getFeatures().getChildNodes().getLength(); i++ )
		//	console.log( ge.getFeatures().getFirstChild().getKml() );
	});
});
