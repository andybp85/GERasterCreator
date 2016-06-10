/*
* maps module wraps Google Earth and provides an easier
* interface for the rest of the program to interact with elements on the
* map.
*/
class Maps {
    constructor(ge) {

        google.load("maps", "1");

        google.maps.createInstance('map3d', initCallback, failureCallback);

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

    failureCallback(errorCode) {
        document.getElementById('map3d').innerHTM = errorCode;
    }

    setOptions(user_options) {

        console.log(user_options);

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

    fireEvent(event, callback) {
        google.maps.addEventListener(ge.getGlobe(), event, callback);
    }

    return {
        init : function() {
            
            console.log(ge);
        },
        updateOptions : function(user_options) {

            //user_options = controls.getOptions();
            console.log(user_options);
            setOptions(user_options);

            //controls.setNodata();
        },
//			makeGrid : function() {
//
//			},
        addEventListener : fireEvent
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
