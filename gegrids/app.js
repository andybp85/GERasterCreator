/* @flow */

import controls from './modules/controls';
import Maps from './modules/Maps';

// // UTILITY METHODS ----------------------------------
// Object.prototype.method = function (name, func) {
    // this.prototype[name] = func;
    // return this;
// };

// HTMLElement.method('fire', function(evt) {
	// if (document.createEvent) {
		// evObj = document.createEvent('MouseEvents');
		// evObj.initEvent(evt, true, false);
		// fireOnThis.dispatchEvent(evObj);
	// } else if (document.createEventObject) { // IE
		// evObj = document.createEventObject();
		// fireOnThis.fireEvent('on' + evt, evObj);
	// }
// });


// GEGrids Namespace ----------------------------------
const GEGrids = (function() {

	/*
	 * GUI & Event Listeners
	 *
	 */
	document.addEventListener('DOMContentLoaded', function () {
		var i = 0,
		    upOpts = document.getElementsByClassName('updateOptions'),
		    newOpts = controls.getOptions();


            const map = new Maps(document.querySelector('#map3d'));


			// google.setOnLoadCallback(maps.init);


			/* maps.addEventListener('mousemove', function (event) { */

				// document.getElementById('latPos').innerHTML = event.getLatitude();
				// document.getElementById('lngPos').innerHTML = event.getLongitude();

// //		        if (mbutton && event.getTarget().getType() == 'KmlPlacemark' && event.getTarget().getGeometry().getType() == 'KmlPolygon') {
// //		            event.preventDefault();
// //		            dataset.boxColorChange(event.getLatitude(), event.getLongitude());
// //		        }
			// });

            // // TODO: implement with array.map()
			// for (i = 0; i <  upOpts.length; i++) {
				// upOpts[i].addEventListener('click', function (e) {
					// maps.updateOptions({
						// status_bar : document.getElementById('statusbar').checked,
						// nav_control : document.getElementById('nav').checked,
						// lat_lng_grid : document.getElementById('LL').checked,
						// overview_map : document.getElementById('overview').checked,
						// scale_legend : document.getElementById('scaleLegend').checked,
						// guide_grids : document.getElementById('guideGrid').checked
					// });
				// });
			// }

        }); 


}());
