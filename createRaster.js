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

// function converDec(val) {
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

//--DATASET-CREATOR----------------------------------

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

var dataset = {
    rasterMap : {
        LRlngVals : {},
        LRlatVals : {}
    },
    
    createMap : function (nLat,nLng) {
        
        this.dataMap = createArray(nLat,nLng);
        
        for (var i = 0; i < nLat; i++) {
            for (var j = 0; j < nLng; j++) {
                this.dataMap[i][j] = 0;    
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
                 data +=  this.dataMap[iLat][iLng];
             }
             data += '\n';
         }        
        
        $('#output').text(data);
    },
    
    boxChange : function(lat,lng,val) {

        var latI = 0;
        while (lat < this.rasterMap.LRlatVals[latI].v) {
            latI++;
        }
        var lngI = numLng - 1;
        while (lng > this.rasterMap.LRlngVals[lngI].v) {
            lngI--;
        }
        
       (dataset.dataMap[latI][lngI]) = val;
        
        this.render();
    }
};

//--GRID-FUNCS---------------------------------

function RemoveAllFeatures() { //needs to take out just placemarks
    var features = ge.getFeatures();
    while (features.getLastChild() != null) {
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
    
//     google.earth.addEventListener(ge.getGlobe(), 'mousemove', function(e) {
//         if (mbutton) {
//             e.preventDefault();
//         }
//     });
//     google.earth.addEventListener(ge.getGlobe(), 'mouseup', function(e) {
//         mbutton = false;
//         console.log('mouseup: ' + mbutton);
//     });
    
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
        count++;
        for (var x = 0; x < numLat; x++) {
            makePolygon(x, y, count);
            if (y == 0) {
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

//     google.earth.addEventListener(placemarks[id], 'click', function(e) {
        
//         var lcolor = placemarks[id].getStyleSelector().getLineStyle().getColor();
//         var pcolor = placemarks[id].getStyleSelector().getPolyStyle().getColor();
        
//         if ( lcolor.get() == "ffffffff") {
//             dataset.boxChange(e.getLatitude(),e.getLongitude(),1);
//             lcolor.set('ff00008B');
//             pcolor.set('ff00008B');
//         } else {
//             dataset.boxChange(e.getLatitude(),e.getLongitude(),0);
//             lcolor.set('ffffffff');
//             pcolor.set('ffffffff');
//         }
//     });
    
//     google.earth.addEventListener(placemarks[id], 'mouseover', function(e) {
//         if (mbutton) {
//             //e.preventDefault();
//             console.log('click');
//             $(placemarks[id]).trigger('mousedown');
//         }
//     });
    
//     google.earth.addEventListener(placemarks[id], 'mouseup', function(e) {
//         mbutton = false;    
//         console.log('mouseup: ' + mbutton);
//     });
    
    
}

function clickInit() {
    
//     var clicking = $(window).on("mousedown", function(e){
//         return true;
//         e.preventDefault();
//     });
    
//     $(target).on("mouseover", function(){
//         while(clicking == true){
//             doTheThing();
//         }
//     });`
    
    // listen for mousedown on the window (look specifically for placemarks)
//     google.earth.addEventListener(ge.getWindow(), 'mousedown', function(event) {
//         event.preventDefault();
//         event.stopPropagation();
        
//         var placemark = event.getTarget();
        
//         if (placemark.getType() == 'KmlPlacemark' &&
//             placemark.getGeometry().getType() == 'KmlPolygon') {
            
//             mbutton = true;
//             console.log(mbutton);
            
            
            
//         } 
//     });
    
//     google.earth.addEventListener(ge.getWindow(), 'mousedown', function(event) {
//         var placemark = event.getTarget();
//         if (placemark.getType() == 'KmlPlacemark' &&
//             placemark.getGeometry().getType() == 'KmlPolygon') {
//             event.preventDefault();
//             mbutton = true;
//             console.log(mbutton);
//         }
//     });
    
    google.earth.addEventListener(ge.getWindow(), 'click', function(event) {
        var placemark = event.getTarget();
        if (placemark.getType() == 'KmlPlacemark' &&
            placemark.getGeometry().getType() == 'KmlPolygon') {
            event.preventDefault();
            (mbutton == false) ? mbutton = true : mbutton = false;
            console.log(mbutton);
        }
    });
    
//     for ( var i = 0; i < placemarks.length; i++ ) {
    google.earth.addEventListener(ge.getWindow(), 'mouseover', function(event) {
        var placemark = event.getTarget();
        if (mbutton) {
            event.preventDefault();
            console.log('over: ' + event.getTarget().getId());
            
            //                 $(placemarks[i]).trigger('mousedown');
            var lcolor = placemark.getStyleSelector().getLineStyle().getColor();
            var pcolor = placemark.getStyleSelector().getPolyStyle().getColor();
            
            if ( lcolor.get() == "ffffffff") {
                dataset.boxChange(event.getLatitude(),event.getLongitude(),1);
                lcolor.set('ff00008B');
                pcolor.set('ff00008B');
            } else {
                dataset.boxChange(event.getLatitude(),event.getLongitude(),0);
                lcolor.set('ffffffff');
                pcolor.set('ffffffff');
            }
        } else {console.log('not: ' + event.getTarget().getId())}
    });
    //     }
    

    google.earth.addEventListener(ge.getGlobe(), 'mousemove', function(event) {
        console.log(event.getLatitude());
        if (mbutton) {
            console.log(event.getTarget().getId() + ' : ' + event.getTarget().getType());
            event.preventDefault();
            event.stopPropagation();

        }
    });
    
//     google.earth.addEventListener(ge.getWindow(), 'mouseup', function(event) {
//         if (mbutton) {
//             mbutton = false;
//             console.log(mbutton);
//         }
//     });
}

//--CONTROLS----------------------------------

$(document).ready(function() {
		
    google.setOnLoadCallback(init);

	$('#drawMap').click(function() {
        startCoords = {
            LL: {
                lat: Number($('#startLLLat').val()),
                lng: Number($('#startLLLng').val()),
                alt: Number($('#startAlt').val())
            },
            LR: {
                lat: Number($('#startLRLat').val()),
                lng: Number($('#startLRLng').val()),
                alt: Number($('#startAlt').val())
            },
            UR: {
                lat: Number($('#startURLat').val()),
                lng: Number($('#startURLng').val()),
                alt: Number($('#startAlt').val())
            },
            UL: {
                lat: Number($('#startULLat').val()),
                lng: Number($('#startULLng').val()),
                alt: Number($('#startAlt').val())
            },
        };	
        
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
