import controls from './modules/controls';
import maps from './modules/maps';

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


// GEGrids Namespace ----------------------------------
var GEGrids = (function() {
	"use strict";

	/*
	 * GUI & Event Listeners
	 *
	 */
	document.addEventListener('DOMContentLoaded', function () {
		var i = 0,
		    upOpts = document.getElementsByClassName('updateOptions'),
		    newOpts = controls.getOptions();


			google.setOnLoadCallback(maps.init);


			maps.addEventListener('mousemove', function (event) {

		    	document.getElementById('latPos').innerHTML = event.getLatitude();
		        document.getElementById('lngPos').innerHTML = event.getLongitude();

//		        if (mbutton && event.getTarget().getType() == 'KmlPlacemark' && event.getTarget().getGeometry().getType() == 'KmlPolygon') {
//		            event.preventDefault();
//		            dataset.boxColorChange(event.getLatitude(), event.getLongitude());
//		        }
		    });

            // TODO: implement with array.map()
			for (i = 0; i <  upOpts.length; i++) {
		    	upOpts[i].addEventListener('click', function (e) {
			        maps.updateOptions({
					    status_bar : document.getElementById('statusbar').checked,
					    nav_control : document.getElementById('nav').checked,
					    lat_lng_grid : document.getElementById('LL').checked,
					    overview_map : document.getElementById('overview').checked,
					    scale_legend : document.getElementById('scaleLegend').checked,
					    guide_grids : document.getElementById('guideGrid').checked
					});
		        });
		    }

		});


}());
