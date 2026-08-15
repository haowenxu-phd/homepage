// using var to work around a WebKit bug

var initial_bounds=[
	[43.501196, -90.140061],
    [40.37544, -96.639485]
    ];

	
	
var baseLayers = {
    "Night Map": L.tileLayer("http://{s}.sm.mapstack.stamen.com/(toner-background,$fff[difference],$fff[@23],$fff[hsl-saturation@20],toner-lines[destination-in])/{z}/{x}/{y}.png"),
    "Topographic": L.esri.basemapLayer("Topographic"),
	//"Oceans": L.esri.basemapLayer("Oceans"),
	"National Geographic": L.esri.basemapLayer("NationalGeographic"),
	"Transportation": L.esri.basemapLayer("ImageryTransportation"),	
	"Imagery":L.esri.basemapLayer("Imagery"),
};
var overlays = {	
};

var map = new L.Map('map', {
  center: [41.935598,-93.389773],
  zoom: 10,
  layers: [baseLayers["Transportation"]],
  maxBounds: initial_bounds,
  maxBoundsViscosity: 1.0,
  minZoom: 8,
});

L.control.layers( baseLayers, null,{position: 'topleft'}).addTo(map);

/*Streets', 'Topographic', 'Oceans', 'NationalGeographic', 'Gray', 'GrayLabels', 'DarkGray', 'DarkGrayLabels', 'Imagery', 'ImageryLabels', 'ImageryTransportation', 'ShadedRelief' or 'ShadedReliefLabels'*/
		
//L.esri.basemapLayer("NationalGeographic").addTo(map); 

//L.tileLayer("http://{s}.sm.mapstack.stamen.com/(toner-background,$fff[difference],$fff[@23],$fff[hsl-saturation@20],toner-lines[destination-in])/{z}/{x}/{y}.png")
        //L.tileLayer("http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png")
 //           .addTo(map);
 
 
 
	
	var Main_layer_styles={		
		
		"mask_style":{
					weight: 2,
					opacity: 0.7,
					fillColor: '#FFFFFF ',
					color: '#999999 ',
					fillOpacity: 0.6,
					stroke:true,
					fill:true,				   
				   },
		"poi_bd_style":{		
					fill:false,
					stroke:"#6600FF",
					weight: 5,
					opacity: 1,
					color: '#FF3399',
					fillOpacity: 0.1,							
				},
				
		};//end of layer style
		
		var Main_layer_features={
			"iowa":{
				"layer_group":"main",
				"geometery_type":"regular",
				"default_style":Main_layer_styles.mask_style,
				"default_layer":"yes",
				"url":"data/state_data/iowa_state_mask.json",
				"onEachFeature":function (feature, layer){	
				
				},
			}
		};// end of feature layer object
		leaflet_map_control.Layer_initialization(map,Main_layer_features); 
		//map.fitBounds([[40.37544, -96.639485],[43.501196, -90.140061]]);  
		
		setTimeout(function(){ 
				
				map.fitBounds([[40.37544, -96.639485],[43.501196, -90.140061]]); 
				var bounds = map.getBounds();
				updateWind_map_engine([bounds]);
				console.log("upb");
			}, 1000);
 
 
var glLayer = L.canvasOverlay()
                       //.drawing(drawingOnCanvas)
                       .addTo(map);
					  $(".leaflet-heatmap-layer").attr('id', 'canvas');
	//$(".leaflet-overlay-pane").append("<canvas id='canvas' class='leaflet-heatmap-layer leaflet-zoom-animated'></canvas>");
	
	
function drawingOnCanvas(canvasOverlay, params) {		
	$(".dg").empty(); 
	render_canvas(canvasOverlay, params);
	var bounds = map.getBounds();
   
	
	
}



map.on('moveend', function(e) {
   var bounds = map.getBounds();
   updateWind_map_engine(bounds);
   //$("#canvas").remove();
    //$(".dg").empty();   
   //$(".leaflet-overlay-pane").append("<canvas id='canvas'></canvas>");
   //render_canvas();
});



	
	//var canvas= params.canvas;	
	//var ctx = params.canvas.getContext('2d');
    //ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);
	
	var canvas = document.getElementById('canvas'); // eslint-disable-line
	const pxRatio = Math.max(Math.floor(window.devicePixelRatio) || 1, 2);
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;

	const gl = canvas.getContext('webgl', {antialiasing: false});

	const wind = window.wind = new WindGL(gl);
	wind.numParticles = 191844;
	wind.speedFactor=0.9;
	wind.fadeOpacity=0.96;
	wind.dropRate=0.016;
	
	function frame() {
		if (wind.windData) {
			wind.draw();
		}
		requestAnimationFrame(frame);
	}
	frame();

	const gui = new dat.GUI();
	gui.add(wind, 'numParticles', 1024, 589824);
	gui.add(wind, 'fadeOpacity', 0.96, 0.999).step(0.001).updateDisplay();
	gui.add(wind, 'speedFactor', 0.05, 1.0);
	gui.add(wind, 'dropRate', 0, 0.1);
	gui.add(wind, 'dropRateBump', 0, 0.2); 

	const windFiles = {
		0: '2016112000',
		6: '2016112006',
		12: '2016112012',
		18: '2016112018',
		24: '2016112100',
		30: '2016112106',
		36: '2016112112',
		42: '2016112118',
		48: '2016112200'
	};

	const meta = {
		'2016-11-20+h': 0,
		'retina resolution': true,
		'github.com/mapbox/webgl-wind': function () {
			window.location = 'https://github.com/mapbox/webgl-wind';
		}
	};
	/*gui.add(meta, '2016-11-20+h', 0, 48, 6).onFinishChange(updateWind);

	if (pxRatio !== 1) {
		gui.add(meta, 'retina resolution').onFinishChange(updateRetina);
	}
	gui.add(meta, 'github.com/mapbox/webgl-wind');
	*/
	var bounds = map.getBounds();
	updateWind_map_engine(bounds)
	//updateWind(0);
	updateRetina();

	function updateRetina() {
		const ratio = meta['retina resolution'] ? pxRatio : 1;
		canvas.width = canvas.clientWidth * ratio;
		canvas.height = canvas.clientHeight * ratio;
		wind.resize();
	}
	//getJSON('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_coastline.geojson', function (data) {
	

	function updateWind(name) {
		//getJSON('wind/' + windFiles[name] + '.json', function (windData) {
		getJSON('./wind/500fm.json', function (windData) {
			const windImage = new Image();
			windData.image = windImage;
			//windImage.src = 'wind/' + windFiles[name] + '.png';
			windImage.src = './wind/90fm.png';
			windImage.onload = function () {
				wind.setWind(windData);
			};
		});
	}
	
	function updateWind_map_engine(bounds) {
		
		//44.53785-40.133331)/y_px;
		//var dx = (-89.89942+97.154167
		//getJSON('wind/' + windFiles[name] + '.json', function (windData) {
		//console.log(bounds);
		//console.log(bounds["_southWest"]);
		//console.log(bounds["_northEast"]);
		
			
		//var lat = (y - 88.5)/847.653177993 + 40.3024338	//new derived
		//var lng = (x+11.5)/847.6531779930 - 96.9579 //new derived
		
		var dy = 0.0011797277777777777; //  44.5394261139 3690
		var dx = 0.0011797277777777777; // -89.9839392417  5900

		
		
		let ystart=(44.5394261139-bounds["_northEast"]['lat'])/dy, yend=(44.5394261139-bounds["_southWest"]['lat'])/dy;
		let xstart=(96.9579+bounds["_southWest"]['lng'])/dx, xend=(96.9579+bounds["_northEast"]['lng'])/dx;
				
		//console.log(xstart+" "+ystart+" "+xend+" "+yend);
		xstart= xstart>=0 ? Math.abs(Math.floor(xstart)): (Math.floor(xstart));
		ystart= ystart>=0 ? Math.abs(Math.floor(ystart)): (Math.floor(ystart));
		xend= xend>=0 ? Math.abs(Math.floor(xend)): (Math.floor(xend));
		yend= yend>=0 ? Math.abs(Math.floor(yend)): (Math.floor(yend)); 		 
		
		//xend= xend<=1741 ? Math.abs(Math.floor(xend)):1741;
		//yend= yend<=1057 ? Math.abs(Math.floor(yend)):1057;		
		xstart=xstart-10.3;
		xend=xend-10.3;	

		ystart=ystart-0.6;
		yend=yend-0.6;	
		console.log(xstart+" "+ystart+" "+xend+" "+yend);
		$(".webgl_zoomdata").remove();
		$("body").append(
				'<canvas id="canvas2" class="webgl_zoomdata" style="display:none;" width="5900" height="3690"></canvas>'
			);
		$("body").append(
			'<canvas id="canvas3" class="webgl_zoomdata" style="display:none;" width="' +
			(xend - xstart) +
			'" height="' +
			(yend - ystart) +
			'"></canvas>'
		);
		
		getJSON('./wind/90fm.json', function (windData) {
			
			var canvas = document.getElementById('canvas2');
						 canvas.crossOrigin="anonymous";
					var full_context = canvas.getContext("2d");
					 
					var imageObj = new Image();					
					imageObj.onload = function(){
						full_context.drawImage(imageObj, 0, 0);	
						var canvas_export = document.getElementById('canvas3');	
						canvas_export.crossOrigin="anonymous";			
						var ctx_zoomed = canvas_export.getContext("2d");
						imgData = full_context.getImageData(xstart, ystart, xend-xstart, yend-ystart);
						ctx_zoomed.putImageData(imgData, 0, 0);
						windData.image = imgData
						wind.setWind(windData);
					};
					imageObj.src = "./wind/90fm.png"; 
		});
		
/*----------------------------------------------------------------------*/		
		/*var dy = (44.53785-40.133331)/1057;
		var dx = (-89.89942+97.154167)/1741;		
		let ystart=(44.53785-bounds["_northEast"]['lat'])/dy, yend=(44.53785-bounds["_southWest"]['lat'])/dy;
		let xstart=(97.154167+bounds["_southWest"]['lng'])/dx, xend=(97.154167+bounds["_northEast"]['lng'])/dx;
				
		//console.log(xstart+" "+ystart+" "+xend+" "+yend);
		xstart= xstart>=0 ? Math.abs(Math.floor(xstart)): (Math.floor(xstart));
		ystart= ystart>=0 ? Math.abs(Math.floor(ystart)): (Math.floor(ystart));
		xend= xend>=0 ? Math.abs(Math.floor(xend)): (Math.floor(xend));
		yend= yend>=0 ? Math.abs(Math.floor(yend)): (Math.floor(yend)); 		 
		
		//xend= xend<=1741 ? Math.abs(Math.floor(xend)):1741;
		//yend= yend<=1057 ? Math.abs(Math.floor(yend)):1057;
		
		xstart=xstart+0;
		xend=xend+0;
		
		console.log(xstart+" "+ystart+" "+xend+" "+yend);
		$(".webgl_zoomdata").remove();
		$("body").append('<canvas id="canvas2" class="webgl_zoomdata" style="display:none;" width="'+1741+'px" height="'+1057+'px]"></canvas>');
		$("body").append('<canvas id="canvas3" class="webgl_zoomdata" style="display:none;" width="'+(xend-xstart)+'px" height="'+(yend-ystart)+'px"></canvas>');
 
 
 
		
		getJSON('wind/500fm.json', function (windData) {
			
			var canvas = document.getElementById('canvas2');
						 canvas.crossOrigin="anonymous";
					var full_context = canvas.getContext("2d");
					 
					var imageObj = new Image();					
					imageObj.onload = function(){
						full_context.drawImage(imageObj, 0, 0);	
						var canvas_export = document.getElementById('canvas3');	
						canvas_export.crossOrigin="anonymous";			
						var ctx_zoomed = canvas_export.getContext("2d");
						imgData = full_context.getImageData(xstart, ystart, xend-xstart, yend-ystart);
						ctx_zoomed.putImageData(imgData, 0, 0);
						windData.image = imgData
						wind.setWind(windData);
					};
					imageObj.src = "wind/500fm.png"; 
		});*/
	}
	
	function updateWind(name) {
		//getJSON('wind/' + windFiles[name] + '.json', function (windData) {
		getJSON('./wind/500fm.json', function (windData) {
			const windImage = new Image();
			windData.image = windImage;
			//windImage.src = 'wind/' + windFiles[name] + '.png';
			windImage.src = 'wind/500fm.png';
			windImage.onload = function () {
				wind.setWind(windData);
			};
		});
	}

	function getJSON(url, callback) {
		const xhr = new XMLHttpRequest();
		xhr.responseType = 'json';
		xhr.open('get', url, true);
		xhr.onload = function () {
			if (xhr.status >= 200 && xhr.status < 300) {
				callback(xhr.response);
			} else {
				throw new Error(xhr.statusText);
			}
		};
		xhr.send();
	}


