/**
 * Maps.js
 * flow
 */

/*
* maps module wraps Google Earth and provides an easier
* interface for the rest of the program to interact with elements on the
* map.
*/
import MapLoader from 'gmaps-loader';
import GEGRIDS_MAPS_API from 'config';

class Maps {

    constructor() {

        this.loader = new MapLoader({
            apiKey: GEGRIDS_MAPS_API
        });

        this.loader.load()
            .then(function(api) {
            new api.Map(document.querySelector('#map3d'), {
                center: {
                lat: -34.397,
                lng: 150.644
                },
                zoom: 8
            });
        });

        /* google.load("maps", "1"); */

        // google.maps.createInstance('map3d', initCallback, failureCallback);

        // ge_options = ge.getOptions();
        // ge_navigation = ge.getNavigationControl();
        // ge.getWindow().setVisibility(true);

        // // add some layers
        // ge.getLayerRoot().enableLayerById(ge.LAYER_BORDERS, true);
        // ge.getLayerRoot().enableLayerById(ge.LAYER_ROADS, true);
        // ge.getLayerRoot().enableLayerById(ge.LAYER_TERRAIN, true);
        // ge.getLayerRoot().enableLayerById(ge.LAYER_TREES, true);
        /* ge.getOptions().setStatusBarVisibility(true); */

        document.getElementById('installed-plugin-version').innerHTML = ge.getPluginVersion().toString();

        console.log(ge);
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

    updateOptions(user_options) {

        console.log(user_options);
            this.setOptions(user_options);


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

