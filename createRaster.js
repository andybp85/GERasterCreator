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
var currentProjectionFolder = null;

var newCoords = null;
var mbutton = false;

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
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }
    return arr;
}

//--DATASET-CREATOR----------------------------------
var dataset = {
    rasterMap : {
        LRlngVals : {},
        LRlatVals : {}
    },
    oldID : null,
	
    createMap : function () {
        
        this.grid = createArray(numLat,numLng);
		this.placemarks = createArray(numLat,numLng);
        console.log(this.placemarks);
        var id = 0;
        for (var i = 0; i < numLat; i++) {
            for (var j = 0; j < numLng; j++) {
                this.grid[i][j] = 0;
				this.placemarks[i][j] = ge.createPlacemark( (id).toString() );
				id++;
            }
        }
    },

    addLat : function(id,LRlatVal){ 
        this.rasterMap.LRlatVals[id] = { 'v' : LRlatVal, 'd' : 0 };
    },
    addLng : function(id,LRlngVal){ 
        this.rasterMap.LRlngVals[id] = { 'v' : LRlngVal, 'd' : 0 };
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
             data += ' ';
         }        
        $('#output').text(data);
    },
    
    getBox : function (lat,lng) {
        var latI = 0;
        while (lat < this.rasterMap.LRlatVals[latI].v) {
            latI++;
        }
		
        var lngI = numLng - 1;
        while (lng > this.rasterMap.LRlngVals[lngI].v) {
            lngI--;
        }
        return {'latI' : latI,'lngI' : lngI};
    },

    boxColorChange : function(lat,lng){
        if (mbutton) {
			
			var LL = dataset.getBox(lat,lng);
							
			if ( this.oldID != ( ( LL.lngI * 10) + LL.latI ) ) {
				if (noData.checked) {
					this.grid[LL.latI][LL.lngI] = noData.val;
					this.placemarks[LL.latI][LL.lngI].getStyleSelector().getLineStyle().getColor().set('ffae33ff');
					this.placemarks[LL.latI][LL.lngI].getStyleSelector().getPolyStyle().getColor().set('ffae33ff');
				} else if ( this.placemarks[LL.latI][LL.lngI].getStyleSelector().getPolyStyle().getColor().get() == "ffffffff" || this.placemarks[LL.latI][LL.lngI].getStyleSelector().getPolyStyle().getColor().get() ==  'ffae33ff') {
					this.grid[LL.latI][LL.lngI] = 1;
					this.placemarks[LL.latI][LL.lngI].getStyleSelector().getLineStyle().getColor().set('ff00008B');
					this.placemarks[LL.latI][LL.lngI].getStyleSelector().getPolyStyle().getColor().set('ff00008B');
				} else {
					this.grid[LL.latI][LL.lngI] = 0;
					this.placemarks[LL.latI][LL.lngI].getStyleSelector().getLineStyle().getColor().set('ffffffff');
					this.placemarks[LL.latI][LL.lngI].getStyleSelector().getPolyStyle().getColor().set('ffffffff');
				}        
			
			this.render();
			
				this.oldID = (LL.lngI * 10) + LL.latI;
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
        $('#latPos').html(event.getLatitude());
        $('#lngPos').html(event.getLongitude());
		if (mbutton && event.getTarget ().getType() == 'KmlPlacemark' && event.getTarget().getGeometry().getType() == 'KmlPolygon') {
			event.preventDefault();
			dataset.boxColorChange(event.getLatitude(),event.getLongitude());
		}
    });
    
    google.earth.addEventListener(ge.getWindow(), 'mouseup', function(event) {
        if (mbutton) {
            mbutton = false;
        }
    });
	
	google.earth.addEventListener(ge.getView(), 'viewchange', function(){
		if (mbutton) {
			console.log(ge.getGlobe());
			$(ge.getGlobe()).trigger('mousedown');
		}
	});
}

function initGrid() {
	RemoveAllFeatures();

	// set the camera view
	var la = ge.createLookAt('');
	la.setLatitude(startCoords.LL.lat);
	la.setLongitude(startCoords.LL.lng);
	la.setRange(5000);
	ge.getView().setAbstractView(la);
	
    dataset.createMap();
	
	genPolygons();
	
	for (x = 0; x < dataset.placemarks.length; x++) {
		for (y = 0; y < dataset.placemarks[x].length; y++) {
			ge.getFeatures().appendChild(dataset.placemarks[x][y]);
		}
	}
    
    clickInit();
}

function genPolygons() {
    for (var lngI = 0; lngI < numLng; lngI++) {
        makePolygon(0, lngI);
        dataset.addLng(lngI,newCoords.LR.lng);
        dataset.addLat(0,newCoords.LR.lat)
        
        for (var latI = 1; latI < numLat; latI++) {
            makePolygon(latI, lngI);
			LLCorner.X = newCoords.LL.lng;
        	LLCorner.Y = newCoords.LL.lat;
            if (lngI === 0) {
                dataset.addLat(latI,newCoords.LR.lat);
            }
        }     
    }
    dataset.render();
}

function makePolygon(latI, lngI) {
    
    var polygon = ge.createPolygon('');
    dataset.placemarks[latI][lngI].setGeometry(polygon);
    
//     var lngDiff = startCoords.LL.lng - startCoords.LR.lng;
//     var latDiff = startCoords.LR.lat - startCoords.UR.lat;
	
	console.log

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
        },
    };
    
    var innerDiff = (startCoords.LR.lng - startCoords.LL.lng) * LINE_WIDTH;

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

    if (!dataset.placemarks[latI][lngI].getStyleSelector()) {
        dataset.placemarks[latI][lngI].setStyleSelector(ge.createStyle(''));
    }    
	
    dataset.placemarks[latI][lngI].getStyleSelector().getLineStyle().setWidth(3);
    dataset.placemarks[latI][lngI].getStyleSelector().getLineStyle().getColor().set('ffffffff');
    dataset.placemarks[latI][lngI].getStyleSelector().getPolyStyle().setFill(1);
}

//--CONTROLS----------------------------------

$(document).ready(function() {
		
    google.setOnLoadCallback(init);

	$('#drawMap').click(function() {
        cellSize = Number($('#cellSize').val());
        
        startCoords = {
            UL: {
                lat: Number($('#startULLat').val()),
                lng: Number($('#startULLng').val()),
                alt: Number($('#startAlt').val())
            },
            LL: {
                lat: Number($('#startULLat').val()) - cellSize,
                lng: Number($('#startULLng').val()),
                alt: Number($('#startAlt').val())
            },
            LR: {
                lat: Number($('#startULLat').val()) - cellSize,
                lng: Number($('#startULLng').val()) + cellSize,
                alt: Number($('#startAlt').val())
            },
            UR: {
                lat: Number($('#startULLat').val()),
                lng: Number($('#startULLng').val()) + cellSize,
                alt: Number($('#startAlt').val())
            }
        };	
        
        numLng = Number($('#numLng').val());
        numLat = Number($('#numLat').val());
		noData.val = Number($('#nodata').val());
		        
        initGrid();
		
	});
	
	
	$('.updateOptions').click(function(e) {
        
        var options = ge.getOptions();
        options.setStatusBarVisibility( $('#statusbar')[0].checked );
        options.setGridVisibility( $('#LL')[0].checked );
        options.setOverviewMapVisibility( $('#overview')[0].checked );
        options.setScaleLegendVisibility( $('#scaleLegend')[0].checked );
    
        if ( $('#nav')[0].checked ) {
            ge.getNavigationControl().setVisibility(ge.VISIBILITY_SHOW);
        } else {
            ge.getNavigationControl().setVisibility(ge.VISIBILITY_HIDE);
        }
		
		noData.checked = $('#nodata-box')[0].checked;
    });

});
