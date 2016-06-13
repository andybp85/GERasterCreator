/*
* Controls Closure Interface for the user to set the option of Google
* Earth, the parameters of the grid being drawn and the ASCII output, and
* handles updating the position display.
*/
const controls = {

    options: {},
    grid_params: {},
    nodata: {},
    setOptions (opts) {
        options = opts;
    },
    getOptions () {
        return this.options;
    },
    setGridParams () {
        this.grid_params.UR_lat = Number(document.getElementById('startURLat').value);
        this.grid_params.UR_lng = Number(document.getElementById('startURLng').value);
        this.grid_params.cell_size = Number(document.getElementById('cellSize').value);
        this.grid_params.altitude = Number(document.getElementById('startAlt').value);
        this.grid_params.num_lat_cells = Number(document.getElementById('numLat').value);
        this.grid_params.num_lng_cells = Number(document.getElementById('numLng').value);
    },
    getGridParams () {
        return grid_params;
    },
    setNodata () {
        this.nodata.checked = document.getElementById('nodata-box').checked;
        this.nodata.value = Number(document.getElementById('nodata').value);
    },
    nodataChecked () {
        return nodata.checked;
    },
    nodataValue () {
        return nodata.value;
    },
    updatePosition (lat, lng) {
        document.getElementById('latPos').innerHTML = lat;
        document.getElementById('lngPos').innerHTML = lng;
    }

};

export default controls;
