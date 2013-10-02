//--GLOBALS---------------------------------

var LINE_WIDTH = 0.04479550075655295;

var startCoords = null;
var numLng = null;
var numLat = null;

var placemarks = [];
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
    
    createMap : function (nLat,nLng) {
        
        this.grid = createArray(nLat,nLng);
        
        for (var i = 0; i < nLat; i++) {
            for (var j = 0; j < nLng; j++) {
                this.grid[i][j] = 0;    
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
        var data = '';
            
         for (var iLat  = 0; iLat < numLat; iLat++) {
             for (var iLng = numLng-1; iLng >= 0; iLng--) {
                 if (iLng != numLng-1) {
                     data += ',';
                 }
                 data += iLat + ',' + iLng + ':' + this.grid[iLat][iLng] + ' ';
             }
             data += '\n';
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
    
    boxChange : function(lat,lng,val) {
       var d = this.getBox(lat,lng);
       (dataset.grid[d.latI][d.lngI]) = val;
       this.render();
    },
    
    boxColorChange : function(lat,lng){
    
        if (mbutton) {
            
            var LL = this.getBox(lat,lng);
            
            var pID = (LL.lngI * 10) + LL.latI;
            
            var lcolor = placemarks[pID].getStyleSelector().getLineStyle().getColor();
            var pcolor = placemarks[pID].getStyleSelector().getPolyStyle().getColor();
            
            if ( lcolor.get() == "ffffffff") {
                this.boxChange(lat,lng,1);
                lcolor.set('ff00008B');
                pcolor.set('ff00008B');
            } else {
                this.boxChange(lat,lng,0);
                lcolor.set('ffffffff');
                pcolor.set('ffffffff');
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

function initGrid() {
	RemoveAllFeatures();

	// set the camera view
	var la = ge.createLookAt('');
	la.setLatitude(startCoords.LL.lat);
	la.setLongitude(startCoords.LL.lng);
	la.setRange(5000);
	ge.getView().setAbstractView(la);
	
    dataset.createMap(numLat,numLng);
    
	// add the grid
	genPolygons();

	for (x = 0; x < placemarks.length; x++) {
		ge.getFeatures().appendChild(placemarks[x]);
	}
    clickInit();
    
    //console.log(dataset);
}

function genPolygons() {
    var count = 0;
    for (var y = 0; y < numLng; y++) {
        makePolygon(0, y, count);
        dataset.addLng(y,newCoords.LR.lng);//,newCoords.UR.lng);
        dataset.addLat(0,newCoords.LR.lat)
        count++;
        for (var x = 1; x < numLat; x++) {
            makePolygon(x, y, count);
            if (y === 0) {
                dataset.addLat(x,newCoords.LR.lat);//,newCoords.UR.lat);
            }
            count++;
        }     
    }
    dataset.render();
}

function makePolygon(latI, lngI, id) {
    
    placemarks[id] = ge.createPlacemark(id.toString());
    var polygon = ge.createPolygon('');
    placemarks[id].setGeometry(polygon);
    
    var lngDiff = startCoords.LL.lng - startCoords.LR.lng;
    var latDiff = startCoords.LR.lat - startCoords.UR.lat;

    newCoords = {
        LL: {
            lat: startCoords.LL.lat + (latI * latDiff),
            lng: startCoords.LL.lng + (lngI * lngDiff)
        },
        LR: {
            lat: startCoords.LR.lat + (latI * latDiff),
            lng: startCoords.LR.lng + (lngI * lngDiff)
        },
        UR: {
            lat: startCoords.UR.lat + (latI * latDiff),
            lng: startCoords.UR.lng + (lngI * lngDiff)
        },
        UL: {
            lat: startCoords.UL.lat + (latI * latDiff),
            lng: startCoords.UL.lng + (lngI * lngDiff)
        },
    };
    
    var innerDiff = (startCoords.LR.lng - startCoords.LL.lng) * LINE_WIDTH;

    var outer = ge.createLinearRing('');
    outer.getCoordinates().pushLatLngAlt(newCoords.LL.lat, newCoords.LL.lng, startCoords.LL.alt); //LL
    outer.getCoordinates().pushLatLngAlt(newCoords.LR.lat, newCoords.LR.lng, startCoords.LR.alt); //LR
    outer.getCoordinates().pushLatLngAlt(newCoords.UR.lat, newCoords.UR.lng, startCoords.UR.alt); //UR
    outer.getCoordinates().pushLatLngAlt(newCoords.UL.lat, newCoords.UL.lng, startCoords.UL.alt); //UL
    polygon.setOuterBoundary(outer);

    var inner = ge.createLinearRing('');
    inner.getCoordinates().pushLatLngAlt(newCoords.LL.lat + innerDiff, newCoords.LL.lng + innerDiff, startCoords.LL.alt); //LL
    inner.getCoordinates().pushLatLngAlt(newCoords.LR.lat + innerDiff, newCoords.LR.lng - innerDiff, startCoords.LR.alt); //LR
    inner.getCoordinates().pushLatLngAlt(newCoords.UR.lat - innerDiff, newCoords.UR.lng - innerDiff, startCoords.UR.alt); //UR
    inner.getCoordinates().pushLatLngAlt(newCoords.UL.lat - innerDiff, newCoords.UL.lng + innerDiff, startCoords.UL.alt); //UL
    polygon.getInnerBoundaries().appendChild(inner);

    if (!placemarks[id].getStyleSelector()) {
        placemarks[id].setStyleSelector(ge.createStyle(''));
    }    
    placemarks[id].getStyleSelector().getLineStyle().setWidth(3);
    placemarks[id].getStyleSelector().getLineStyle().getColor().set('ffffffff');
    var polyColor = placemarks[id].getStyleSelector().getPolyStyle();
    polyColor.setFill(1);
}

function clickInit() {
    
    var oldID = null;
    
    google.earth.addEventListener(ge.getWindow(), 'mousedown', function(event) {
        var placemark = event.getTarget();
        if (placemark.getType() == 'KmlPlacemark' &&
            placemark.getGeometry().getType() == 'KmlPolygon') {
            event.preventDefault();
            mbutton = true;
//             console.log(mbutton);
            dataset.boxColorChange(event.getLatitude(),event.getLongitude());
        }
    });
    
    google.earth.addEventListener(ge.getGlobe(), 'mousemove', function(event) {
        if (mbutton) {
            event.preventDefault();
            
            var LL = dataset.getBox(event.getLatitude(),event.getLongitude());
            if ( oldID != ( ( LL.lngI * 10) + LL.latI ) ) {
                oldID = (LL.lngI * 10) + LL.latI;
                dataset.boxColorChange( event.getLatitude(),event.getLongitude() );
            }

            

        }
    });
    
    google.earth.addEventListener(ge.getWindow(), 'mouseup', function(event) {
        if (mbutton) {
            mbutton = false;
        }
    });
}
//--CONTROLS----------------------------------

$(document).ready(function() {
		
    google.setOnLoadCallback(init);

	$('#drawMap').click(function() {
        startCoords = {
            UL: {
                lat: Number($('#startULLat').val()),
                lng: Number($('#startULLng').val()),
                alt: Number($('#startAlt').val())
            },
            LL: {
                lat: Number($('#startULLat').val()) - Number($('#cellSize').val()),
                lng: Number($('#startULLng').val()),
                alt: Number($('#startAlt').val())
            },
            LR: {
                lat: Number($('#startULLat').val()) - Number($('#cellSize').val()),
                lng: Number($('#startULLng').val()) + Number($('#cellSize').val()),
                alt: Number($('#startAlt').val())
            },
            UR: {
                lat: Number($('#startULLat').val()),
                lng: Number($('#startULLng').val()) + Number($('#cellSize').val()),
                alt: Number($('#startAlt').val())
            }
        };	
        
        console.log(startCoords);
        
        numLng = Number($('#numLng').val());
        numLat = Number($('#numLat').val());
        
        initGrid();
		
	});
	
	
	$('.updateOptions').click(function() {
        
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
    });

});
