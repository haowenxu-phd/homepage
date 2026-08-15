
var leaflet_json={	
"layer_setstyle_reset":function(layer_group,default_style){	
	for (var each_layer in layer_group){
		var layer=each_layer;
		for(var each in layer["_layers"]){		
		layer["_layers"][each].setStyle(default_style);
		layer["_layers"][each].bringToBack();
	}}	
},
//------------------------------------------------------------------------------------
"feature_highlight":function(feature, layer,defualt_style,properties_name){	
		layer.on('mouseout', function (e) {		
		layer.setStyle(defualt_style);
		});			
		layer.on('mouseover', function (e) {
		this.bringToBack();
		var properties_name=$('#search_parameter').val();
		$('#search_box').val(feature.properties[properties_name]);	
			 layer.setStyle({        	
						weight: 3,
						opacity: 1,
						color: '#0099FF ',
						fillOpacity: 0.01,
						fill:true,
						stroke:true,
					});
							});
},
"feature_highlight_lite":function(layer,feature,change_style){	
		var restore_style;
		layer.on('mouseout', function (e) {	
			 layer.setStyle(restore_style);
			 //layer.bringToBack();

		});	
		


			 layer.on('mouseover', function (e) {	
			
			 restore_style=layer.options;
			 //defaultOptions   options
			 layer.setStyle(change_style);
			 //layer.bringToFront();
							});	
},
"feature_highlight_lite_manual":function(layer,feature,change_style,restore_style){	
		
		layer.on('mouseout', function (e) {	
			 layer.setStyle(restore_style);

		});	


			 layer.on('click', function (e) {	
			
			 
			 //defaultOptions   options
			 layer.setStyle(change_style);
							});	
}
//------------------------------------------------------------------------------------
};
//used to handle special json form
var layer_secial_json_handeler={
	"topojson":function(local_layer_group,key,Layer_features,style){
		//leaflet_topojson_initilizer(key,Layer_features,style);		
	}	
};
// end of special json handeler

var leaflet_wms={
"nhd_dynamic_river_layer":function(map,layer_name,initial_stream_ord){
	
				river_wms_display(initial_stream_ord);

			map.on('zoomend', function(e) {
			var stream_order=zoom_to_streamord(map.getZoom());				
		
			map.removeLayer(window[layer_name]);
			river_wms_display(stream_order);
			});
			function zoom_to_streamord(zoom){ 
				 return zoom > 12  ? 0   :           
						   zoom > 11  ? 0 :
						   zoom > 9   ? 2 :
						   zoom > 7   ? 4 :
						   zoom > 5   ? 5 :
						   zoom > 0   ? 6 :
									  6;
				}
			function river_wms_display(stream_order){
			streamorder_wms_url_new="http://s-iihr32.iihr.uiowa.edu/geoserver/Iowa_Watershed/wms?CQL_FILTER=streamorde>="+stream_order;
			window[layer_name] = L.tileLayer.wms(streamorder_wms_url_new, {
			layers: 'Iowa_Watershed:nhdriver_utm84_comp',
			format: 'image/png8',
			version: '1.1.0',
			transparent: true,
			srs:32615,
			attribution: "",
			tiled:true,
			opacity:0.4,
			styles:"NHD_river",
			})
			window[layer_name].addTo(map);
			window[layer_name].bringToFront();	
			}
			
			/*-------the code below will fix the z-index problem when layer changed ---*/
			map.on('baselayerchange', function(e) {      // this was a bug, now fixed, this piece is important
				window[layer_name].bringToFront();	
			});
			/*-------end of fixing the z-index problem when layer changed ---*/
	
},	 
};   //
var leaflet_map_control={
	"map_basic_control_blocks":function(map,map_bound,layers_list){
				var full_ext="<button  class='map_btn' id='reset_map' >Full Extent</button>";
				var reset_map="<button  class='map_btn' id='reset_app' >Reset App</button>";
				
				var reset_bars=full_ext+reset_map;
				//$('.leaflet-top.leaflet-right').append(reset_bars);
				$('.leaflet-control-container').append(reset_bars);
				$(document).on("click", "#reset_map", function(e) {
				map.fitBounds(map_bound);
				});
				$(document).on("click", "#reset_app", function(e){
				 location.reload(); 
				});
				/*------------- above will append the two reset btns -----------*/
				/*------blocks below will append leaflet original map layer controls --------*/
				/* -- the order really matters, the layer control must after the two btns, otherwide the UI will overlaps ---*/		
				
				L.control.zoom({
				  position: "topright"
				}).addTo(map); 
				
				/*------------- below is the map control logo and size overwrite -----------*/
				L.control.layers(layers_list).addTo(map);
				$('.leaflet-control-layers-toggle').css('background-image', 'url(assets/img/map_control/basemaps.png)');
				$('.leaflet-control-layers-toggle').css('width', '112px');  //background-size: 123px 28px;
				$('.leaflet-control-layers-toggle').css('height', '25px');  //background-size: 123px 28px;
				$('.leaflet-control-layers-toggle').css('background-size', '112px 25px');  //background-size: 123px 28px;
		/*------------- end of map control logo and size overwrite -----------*/
		
	},
	"show_leaflet_layer":function(options){	  //leaflet_map_control.show_leaflet_layer
		var button_id=options["button_id"];
		var layer=options["layer"];
		var changed_value=options["new_btn_text"];
		var option=options["option"];
		var default_val=$("#"+button_id).html();
		var default_val_btn=$("#"+button_id).val();
		
		$("#"+button_id).unbind();
		$(document).on("click","#"+button_id,function() {


		if($("#"+button_id).html()==default_val){
			//remove_all_wms(DSS_culvert_wms,"wms_trigger");
			$("#"+button_id).html(changed_value);
			$("#"+button_id).val(changed_value);
			for(var i in layer){
			map.addLayer(layer[i]);	
			layer[i].bringToFront();
			}
			
			if(options.hasOwnProperty("legend")){
				leaflet_legend(options["legend"][0],options["legend"][1],options["legend"][2]);
			}
			
		}else{
			for(var i in layer){
				map.removeLayer(layer[i]);
			}
			$("#"+button_id).html(default_val);
			$("#"+button_id).val(default_val_btn);
			if(options.hasOwnProperty("legend")){		
				
				$(".leaflet-legend ").remove();
			}
		}		
	
	});
		
	},
	"hide_leaflet_layer":function(options){		  //leaflet_map_control.show_leaflet_layer
		var button_id=options["button_id"];
		var layer=options["layer"];
		var changed_value=options["new_btn_text"];
		var default_val=$("#"+button_id).html();
		
		
		
		
		$("#"+button_id).click(function(e) {	
			
		if($("#"+button_id).html()==default_val){
			//remove_all_wms(DSS_culvert_wms,"wms_trigger");
			$("#"+button_id).html(changed_value);
			//console.log(typeof(layer));
			if(typeof(layer.length)=='undefined'){
			map.removeLayer(layer);	
			}else{
				for(var i in layer){
					map.removeLayer(layer[i]);	
					
				}
				
			}//end of if statement
			
		}else{
			if(typeof(layer.length)=='undefined'){
			map.addLayer(layer);	
			}else{
				for(var i in layer){
					map.addLayer(layer[i]);
					
				}
				
			}
			$("#"+button_id).html(default_val);
		}		
	
	});
		
	},
	"dss_leaflet_layer_group":function(input_id){
			window["app_layer_grouup_key"];
			/*
			if(sidebar_holder_id.indexOf("panel") != -1){	
				app_layer_grouup_key=sidebar_holder_id.replace("panel", "leaflet_layers"); 
			}else{
				app_layer_grouup_key=sidebar_holder_id;
			}
			*/
			app_layer_grouup_key=input_id+"_leaflet_layers";
			//console.log(app_layer_grouup_key);
			
			if(!window.hasOwnProperty(app_layer_grouup_key)){
				window[app_layer_grouup_key]={};
			    
			}else{
			
			}
			
		  return app_layer_grouup_key
	},
	"Layer_initialization":function(map,Layer_features){

				try{
					var default_layer_adding={
						"yes":function(local_key,local_layer_group){  
									console.log("tried");
									console.log(Layer_features[local_key]["url"]);
									$.getJSON(Layer_features[local_key]["url"], function (data) {
									//console.log(data)
									//must include Jquery script
									window[local_layer_group][local_key].addData(data);
									Layer_features[local_key]["json"]=data;
									});	
									//console.clear();									
									map.addLayer(window[local_layer_group][local_key]);	
									
						},
						"query_string_mask_fit_bound":function(local_key,local_layer_group){  
						if(window["dss_query_string"]["ws_boundary"]!="default"){
								//if(window["dss_query_string"]["dss_project"]!="state"){
								$.getJSON(Layer_features[local_key]["url"], function (data) {
								window[local_layer_group][local_key].addData(data);
								Layer_features[local_key]["json"]=data;
								
								var coord_collection=data.geometry.coordinates;								
								var max_geom_length=0;
								var max_geom={};
								for(var each_cor_group in coord_collection){
									if(coord_collection[each_cor_group].length>max_geom_length){
										max_geom_length=coord_collection[each_cor_group].length;
										max_geom=coord_collection[each_cor_group];
									}
								}
								var x_list=[];
								var y_list=[];
								for(var each_coor in max_geom){
									x_list.push(Number(max_geom[each_coor][0]));
									y_list.push(Number(max_geom[each_coor][1]));
								}
													
								var hole_bound=[[Math.min(...y_list), Math.min(...x_list)],[Math.max(...y_list), Math.max(...x_list)]];
								//console.log(hole_bound);
								map.fitBounds(hole_bound);
								
								});	
									//console.clear();
								map.addLayer(window[local_layer_group][local_key]);}
									
						},
						"load_not_add":function(local_key,local_layer_group){  
						//console.log(Layer_features[local_key]["url"]);
						//console.log(Layer_features[local_key]["url"]);
									$.getJSON(Layer_features[local_key]["url"], function (data) {
										//console.log(data)
									window[local_layer_group][local_key].addData(data);
									Layer_features[local_key]["json"]=data;
									});	
									//console.clear();									
									//map.addLayer(window[local_layer_group][local_key]);	
									
						},
						"query_string":function(local_key,local_layer_group){
							if(window["dss_query_string"]["ws_boundary"]!="default"){
								//if(window["dss_query_string"]["dss_project"]!="state"){
								$.getJSON(Layer_features[local_key]["url"], function (data) {
								window[local_layer_group][local_key].addData(data);
								Layer_features[local_key]["json"]=data;
								});	
									//console.clear();
								map.addLayer(window[local_layer_group][local_key]);}	
						},	
					} //end of default layer adding
					
					
					
					var geojson_layer_construct={
						"circular_marker":function(local_layer_group,local_key,local_layer_style,local_each_layer_data){
							
										//console.log(local_key);										
										window[local_layer_group][local_key] = L.geoJson(null, {style: function (feature) 
										{return feature.properties && feature.properties.style;},
										pointToLayer: function (feature, latlng) {return L.circleMarker(latlng,local_layer_style);},	
										onEachFeature: function (feature, layer) { 
										local_each_layer_data["onEachFeature"](feature, layer);	
										}
										});				
						},
						"regular":function(local_layer_group,local_key,local_layer_style,local_each_layer_data){
													//start generation of polygon
										 window[local_layer_group][local_key] = L.geoJson(null, {style:local_layer_style ,onEachFeature: function (feature, layer) {	
										 local_each_layer_data["onEachFeature"](feature, layer);					
										}//end of oneach				
										});//end of layer creation	
						}
					};

					
					
					var json_format_handler={
						"json":function(local_layer_group,local_key,local_layer_style,local_each_layer_data){ 
									
						 if (Layer_features[local_key].geometery_type){
							 
							 geojson_layer_construct[Layer_features[local_key].geometery_type](local_layer_group,local_key,local_layer_style,local_each_layer_data);			 
							
						 }else{
							 
							 geojson_layer_construct["regular"](local_layer_group,local_key,local_layer_style,local_each_layer_data);
						 }
						
						
												
										
						if (Layer_features[local_key].default_layer){
										
						default_layer_adding[Layer_features[local_key].default_layer](local_key,local_layer_group);
										   
						} //end of adding default layer 	
						
						
						
						},// end of regular json
						"special_format":function (local_layer_group,local_key,local_layer_style,local_each_layer_data){  
							var format=Layer_features[local_key].special_format;
								layer_spatial_json_handeler[format](local_layer_group,local_key,Layer_features,local_layer_style );
								
								if (Layer_features[local_key].default_layer){
									
									$.getJSON(Layer_features[local_key]["url"], function (data) {
										  window[local_layer_group][local_key].addData(data);		  
										  
										});		
									map.addLayer(window[local_layer_group][local_key]);
								}	
						},			
					}
					
					
					for( var key in Layer_features){
					!function outer(key){ //for loop function call back
					
					//console.log(key);
								
							var each_layer_data=Layer_features[key];
							var  layer_style= each_layer_data["default_style"];
							var  layer_group= each_layer_data["layer_group"];
							if (layer_group in window){
								//check if the window obj has the properties of layer group
							}else{
								window[layer_group]={};
							}
							
									
							if (Layer_features[key].special_format){ // check to see if it is json 
								
							json_format_handler["special_format"](layer_group,key,layer_style,each_layer_data);

								
							}
							else{
								
							json_format_handler["json"](layer_group,key,layer_style,each_layer_data);
												  
							}//end of started to handel json that are not special format		
								
								

								}(key)	
								
								//setTimeout(function(){ 
								
								//start of layer ordering
								$( document ).ajaxStop(function() {
								//console.log("all stp");

									for ( var key2 in Layer_features){
										!function outer(key2){ //for loop function call back
											var each_layer_data2=Layer_features[key];
											var  layer_group2= each_layer_data2["layer_group"];
											
											if (Layer_features[key2].bringtofront){
												//console.log(key2);
												window[layer_group2][key2].bringToFront();
												}
											if (Layer_features[key2].fit_bound){
												//console.log(key2);												    
												// Layer_features[local_key]["bound"]=window[layer_group2][key2].getBounds();
												//console.log(window[layer_group2][key2]);
												 map.fitBounds(window[layer_group2][key2].getBounds());
												}
										

										}(key2)
										}
								});



								//}, 3000);


															
				}//end of for loop
		
		
		}//end of try catch
			catch(err) {
				//console.log(err);
			}
		
		
		
	},
}
//-----------------------------------------------------------------------------------------------------------------------------------------------------------
 //end of generating map erset buttons
//------------------------------------------------------------------------------------------------------------------------------------------------------------


var ui_element_control={
	"navbar_collapse":function(){		
				$("#the_watershed_category").click(function() {
				  $("#aboutModal").modal("show");
				  return false;
				});
				$("#full-extent-btn").click(function() {
				  map.fitBounds(catchment_bound_center);
				  return false;
				});
				$("#legend-btn").click(function() {
				  $("#legendModal").modal("show");
				  return false;
				});
				$("#login-btn").click(function() {
				  $("#loginModal").modal("show");
				  return false;
				});
				$("#list-btn").click(function() {
				  $('#sidebar').toggle();
				  map.invalidateSize();
				  return false;
				});
				$("#nav-btn").click(function() {
				  $(".navbar-collapse").collapse("toggle");
				  return false;
				});
				$("#sidebar-toggle-btn").click(function() {
				  $("#sidebar").toggle();
				  map.invalidateSize();
				  return false;
				});
				$("#sidebar-hide-btn").click(function() {
				  $('#sidebar').hide();
				  map.invalidateSize();
				});
	},
	"window_resize_nav_map_css":function(){		
					if(window.innerWidth>767){
					var container_height=window.innerHeight-$("#nav_container").height();

					$("#container").css('height', container_height);
					$("#container").css('top', $("#nav_container").height());	
						
					}
					if(window.innerWidth<=767 && window.innerWidth>315){
						//console.log(window.innerWidth);
						//console.log($("#nav_container").height());
					$("#container").css('height', window.innerHeight-$("#nav_container").height());
					$("#container").css('top', 0);	
					}
					if(window.innerWidth<=315){
						//console.log(window.innerWidth);
						//console.log($("#nav_container").height());
					$("#container").css('height', window.innerHeight-$("#nav_container").height());
					$("#container").css('top', 50);	
					}	
					}	
};


var dss_core={
	"layer_event":{
		"mask_cliping_hydro_semantics":function(feature,layer){			
					var max={
						"array_length":0,
						"coord":[]
					}
					var coord_group=feature.geometry.coordinates;
						for(var each_coord in coord_group){
							if(coord_group[each_coord].length>=max.array_length){
								max.array_length=coord_group[each_coord].length;
								max.coord=coord_group[each_coord];				
							}			
						}		
						var wbd_json={
							  "type": "Feature",
							  "geometry": {
								"type": "Polygon",
								"coordinates": [max.coord]
							  },
							  "properties": feature.properties,
							};
							//console.log(feature.properties);
							//console.log(wbd_json);
							var huc={};
							
							
							var huc_level=["huc_8","huc_10","huc_12"];
									for(var each_huc in huc_level){	
										huc=feature.properties.huc;					
										if(typeof(huc)!="undefined"){  
										if(huc_level[each_huc]!="comid"){
											if(typeof(huc[huc_level[each_huc]])=="undefined" || (huc[huc_level[each_huc]]).length==0){
												
												huc[huc_level[each_huc]]="null";
											}
										}// end of type of
										}else{
											huc={"project_ws":{}};

										}
									} 
									
									
									
										$.post("assets/php/spatial_query_control.php",{									
											feature_geom: JSON.stringify(wbd_json), 
												huc_list:JSON.stringify(huc),
										},
										function(data, status){
											
											var final_data=JSON.parse(data);
											//console.log(final_data);
											window["wb_clip_feature"]={}; 
											window["wb_clip_feature"]["state_sensor"]=final_data.sensor;
											//console.log(window["wb_clip_feature"]["state_sensor"]);
											
											

											
												window["wb_clip_feature"]["HUC"]={
													"Project":final_data.project,
													"HUC8":final_data.huc8,
													"HUC12":final_data.huc12,
													"HUC10":final_data.huc10,
													
												}
												
												
												//if(window["dss_query_string"]["dss_project"]!="state"){
													//generate dss event via spatial query
													//construct dss inside
													var temp_project_list=final_data.project;												
													for (var index in temp_project_list){
																!function outer(index){

																var each_proj_ws=temp_project_list[index][0];														
																var projects_array=((ws_project_generate_project_prompt(each_proj_ws,watershed_projects,project_detail,"info"))["project_key"]).split("+");
																for(var each_proj_key in projects_array){
																	
																	if(window["query_string_controller"]["dss_model_by_ws"].hasOwnProperty(projects_array[each_proj_key])){  //test if the project is defined in the project_plugin_spec obj		
																	var project_spec=window["query_string_controller"]["dss_model_by_ws"][projects_array[each_proj_key]];
																	parse_app_btn_event(project_spec,each_proj_ws);  //dss control ebvent function
																	}//end of if															
																}//end of for
																	
																 }(index)
															}//generate events of dss
													//end of generating dss event via spatial query
												//}	
												
												
												//start of generating sensor window
												//$( document ).ajaxComplete(function( event, xhr, settings ) {
													
												$.getJSON( "data/state_data/state_sensors.json", function( data ) {
												
												var sensor_data_file=data.features;		
												for(var each_sensor in sensor_data_file){
													var site=sensor_data_file[each_sensor]["properties"];
													
													//test if the sensor block exist
													if(window["wb_clip_feature"]["state_sensor"].indexOf(site["site_code"])!=-1){
														
														var sensor_org=site["org"];
														var site_group=site["sensor_gro"].split(","); 
														for(var each_group in site_group){
															var each_domain=site_group[each_group];
															
															if($("."+each_domain+"_list").length==0){
																//var sub_sensor_group_list="<h4>"+each_domain+"</h4><ul class='"+each_domain+"_list' ><ul>";
																var sub_sensor_group_list='<div class="panel panel-default"><div class="panel-heading" ><h4 class="panel-title"><a data-toggle="collapse" href="#'+each_domain+'collapse">'+ws_code_to_title(each_domain)+'</a></h4></div><div id="'+each_domain+'collapse" class="'+each_domain+'_list panel-collapse collapse"></div></div>';
        														$("#sensor_list").append(sub_sensor_group_list);
																var each_sensor_entry='<div class="panel-body">'+sensor_org+' - '+site["site_code"]+'</div>';
																$("."+each_domain+"_list").append(each_sensor_entry);
															}else{
																var each_sensor_entry='<div class="panel-body">'+sensor_org+' - '+site["site_code"]+'</div>';
																$("."+each_domain+"_list").append(each_sensor_entry);
															}
															
														}//end of for loop
														
													}
												}
																								
												});// end of ajax stop
												//End of generating sensor window	
													
											
											
											
											var html_result="<br><br>";
											for(var each_huc in window["wb_clip_feature"]["HUC"]){
												if(window["wb_clip_feature"]["HUC"][each_huc].length!=0){
													
													//------------------------constructing tables for catagory------------------
													if(each_huc!="Project"){
													var watershed_list_class=each_huc.replace(" ", "_")+"_list_class";
													if($('#'+watershed_list_class).length == 0){ //test if the huc list already exist
														
														var huc_table_html="<h5><b>"+each_huc+"  watershed:</b></h5><ul class='list-group "+watershed_list_class+"'></ul>"
														$("#watershed_list").append(huc_table_html);
														
													}
													}
													//------------------------------treat project models and generic watershed sepreately---------------------
													if(each_huc=="Project"){
													var project_list_class=each_huc+"_class";
													if($('#'+project_list_class).length == 0){ //test if the huc list already exist
														
														var project_table_html="<h5><b>Watershed : Model</b></h5><ul class='list-group "+project_list_class+"'></ul>"
														$("#project_list").append(project_table_html);
														
													}
													}
													//------------------------constructing tables for catagory------------------
													
													for(var each_item in window["wb_clip_feature"]["HUC"][each_huc]){
														var each_item=window["wb_clip_feature"]["HUC"][each_huc][each_item];
														//console.log(each_item);
														var huc_id=each_item[1];
														
														if(each_huc=="Project"){
															
														if(window["dss_query_string"]["dss_project"]=="yes1"){
															var text_project=ws_code_to_title(each_item[1]);	
															var each_item_html="<li class='list-group-item' id='"+huc_id+"'>"+ text_project +"</li>"
															$('.'+project_list_class).append(each_item_html);		
															
														}else{
															//this block handels the project table from spatial query
															var project_obj_list = ws_project_generate_project_prompt(each_item[0],watershed_projects,project_detail,"project_list");
															//console.log(project_obj_list);
															for(var i in project_obj_list){
															var each_item_html="<li class='list-group-item' id='"+each_item[0]+each_item[1]+"'>"+ ws_code_to_title(each_item[0])+": "+project_obj_list[i]["display_title"] +"</li>";
															$('.'+project_list_class).append(each_item_html);		
																
															}

														}

														}// end of appending project
														if(each_huc!="Project"){
														//console.log(each_item);	
														if(each_item.length>1){
															var each_item_html="<li class='list-group-item' id='"+huc_id+"'>"+each_item[0]+" basin - "+each_item[1]+"</li>";
														}else{
															var each_item_html="<li class='list-group-item' id='"+each_item[0]+"'>"+ws_code_to_title(each_item[0])+" basin </li>";
														}
														
														
														$('.'+watershed_list_class).append(each_item_html);	
														}
														

													}												
													//html_result+="<p align='center'><p>"+each_huc+" watershed:</p><p> "+window["wb_clip_feature"]["HUC"][each_huc]+"</p></p><br>";
													
												}								
											}
											
											
											
											$("#the_watershed_category").click(function() {
											  $("#Summary_Modal").modal("show");
											  return false;
											});
											
												function ws_code_to_title(ws_name){
																var text_project_array=ws_name.split("_");
															if(text_project_array.length>1){
																return capitalizeFirstLetter(text_project_array[0])+" "+capitalizeFirstLetter(text_project_array[1]);	
															}else{
																return capitalizeFirstLetter(text_project_array[0]);	
															}
																
															}
										});			
							
		},
		
		
		
	},//end of layer_event
	//strat of new dss_core blocks
	"dss_controls":{         //dss_core["dss_controls"]["getQueryVariable"]
		"getQueryVariable":function(variable) {
			var query = window.location.search.substring(1);
			var vars = query.split('&');
			for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split('=');
				if (decodeURIComponent(pair[0]) == variable) {
					return decodeURIComponent(pair[1]);
				}
			}   
			return "default";
		},
		
		
		
		
		
		
		
		
	},	
};


var data_conversion={
	"csvToJSON":function(csvString){  
		  var csvArray   = [];
		  // Break it into rows to start
		  var csvRows=csvString.split(/\n/);
		  
		  // Take off the first line to get the headers, then split that into an array
		  var csvHeaders = csvRows.shift().split(',');

		  // Loop through remaining rows
		  for(var rowIndex = 0; rowIndex < csvRows.length; ++rowIndex){
			var rowArray  = csvRows[rowIndex].split(',');

			// Create a new row object to store our data.
			var rowObject = csvArray[rowIndex] = {};
			
			// Then iterate through the remaining properties and use the headers as keys
			for(var propIndex = 0; propIndex < rowArray.length; ++propIndex){
			  // Grab the value from the row array we're looping through...
			  var propValue =   rowArray[propIndex].replace(/^"|"$/g,'');
			  // ...also grab the relevant header (the RegExp in both of these removes quotes)
			  var propLabel = csvHeaders[propIndex].replace(/^"|"$/g,'');;
			  rowObject[propLabel] = propValue;
			}
		  }
		  return csvArray;	
	},	
}


function pushpin(){
   var pushpinL = L.icon({
    iconUrl: 'data/map_control/brown_marker.png', 
    iconSize:     [25, 41], // size of the icon  
    iconAnchor:   [12.5, 42], // point of the icon which will correspond to marker's location   
    popupAnchor:  [-10, -90] // point from which the popup should open relative to the iconAnchor
});
return pushpinL;
   }
 
 
 
function getScripts(scripts, callback) {
    var progress = 0;
    var internalCallback = function () {
        if (++progress == scripts.length) { callback(); }
    };

    scripts.forEach(function(script) { $.getScript(script, internalCallback); });
};

/*
var layer_spatial_json_handeler={
	"topojson":function(local_layer_group,key,Layer_features,style){
		leaflet_topojson_initilizer(key,Layer_features,style);		
	}	
}*/


window["dss_scripting"]=[];
function script_manager(script_list){
	
	 var get_list_txt="";
	 for(var each_script in script_list){// iterated the list of adding script
		 !function outer(each_script){
			 
			// $( document ).ajaxStop(function() { //started of ajax stop

		if(window["dss_scripting"].indexOf(script_list[each_script])==-1){ //when it equals -1, means the script is not loaded into the system			
			get_list_txt+="$.getScript('"+script_list[each_script]+"'),";
			window["dss_scripting"].push(script_list[each_script]);				
		}else{
			//console.log(script_list[each_script]+" already loaded");
		}
		//});//end of ajax stop
		}(each_script)
	 }
	// console.log(window["dss_scripting"]);   //this console will not gonna work, because it takes time to load script one by one
	 var final_script_list="$.when("+get_list_txt+"$.Deferred(function( deferred ){console.log(deferred);$( deferred.resolve ); })).done(function(){	/*console.log('all loaded')*/;}); ";
	 eval.apply(window, [final_script_list]);
	 //console.log(window["dss_scripting"]);
 }
 
 
function superbag(sup, sub) {
    sup.sort();
    sub.sort();
    var i, j;
    for (i=0,j=0; i<sup.length && j<sub.length;) {
        if (sup[i] < sub[j]) {
            ++i;
        } else if (sup[i] == sub[j]) {
            ++i; ++j;
        } else {
            // sub[j] not in sup, so sub not subbag
            return false;
        }
    }
    // make sure there are no elements left in sub
    return j == sub.length;
}



function dss_layer_group_handler(layer_group_name,action){

		
		
		for(var each_layer_index in window[layer_group_name]){
			
			
			
					if(action=="add"){
						map.addLayer(window[layer_group_name][each_layer_index]);
						
						
					}
					if(action=="removal"){
						map.removeLayer(window[layer_group_name][each_layer_index]);
						
					}			
		}		
	//}	
	   
}


function leaflet_map_switch_layer(layer_control_group,layer_name){
			for(var each in layer_control_group){
				  if(map.hasLayer(layer_control_group[each])){
					map.removeLayer(layer_control_group[each]);
					map.addLayer(layer_name);
				  }
				  
				}
	}


function loading_sidebar( ui_obj ){
	
	var data_sidebar_html=ui_obj['sidebar_ui_html'];
	var side_panel_title=ui_obj['sidebar_ui_title'];
	var side_panel_id=ui_obj['panel_id'];
	if(typeof(side_panel_id)=="undefined"){
		side_panel_id='';
	}
	var outer_collapse='<div class="panel panel-default" id="'+side_panel_id+'"><div class="panel-heading section-title"><h5 class="panel-title" style="margin-top:10px" >'+side_panel_title+'</h5></div><div id="'+side_panel_id+'_collapse" class="panel-collapse collapse in"> '+data_sidebar_html+'</div>  </div>';
	
	

	
	/*-------------------this section generate the sidebar UI, it is one time job-----------------------*/
	var sidebar_holder_id=ui_obj["app_btn_id"]+"_panel"; //linked to the holder generated in "map_setup"
	if(typeof(sidebar_holder_id)=="undefined"){
		//console.log("the sidebar_holder_id in hydro tool script is not linked to correct object in 'map setpu' script");			
	}// try to retrieve id for the panel "sidebar holder"
	/*-------------------------check if it is the first time to laod the UI, if not, it won't load------------------*/
	
	if(ui_obj.hasOwnProperty("panel_id")){		
		if ($('#'+side_panel_id).length == 0) {
			$("."+sidebar_holder_id).append(outer_collapse);
				
			//first time loading, UI doesnt exists before.
		} 
		
	}else{
		
		$("."+sidebar_holder_id).append(outer_collapse);	
	}
	
	
	
	/*-------------------end of generating generate the sidebar UI, it is one time job-----------------------*/

	
	if(!window.hasOwnProperty(ui_obj["app_leaflet_layer"])){
		
		window[ui_obj["app_leaflet_layer"]]={};
	}
	
	$("#sidebar").css('width', '310px');
	}
	


function leaflet_external_color_coding(input_obj){
	
	var layer=input_obj["layer"]["_layers"];
	var scenario_name=input_obj["scenario_name"];
	var color_function=input_obj["color_function"];
	//onsole.log(scenario_name);
	
			for(var each_element in layer) {
				!function outer(each_element){
				var feature=layer[each_element]['feature'];
				
				var coding_value=feature.properties[scenario_name];
				//{"color":color_function(coding_value),"stroke":true}
				//console.log(coding_value);
				layer[each_element].setStyle(  color_function(coding_value)  );
			
				
				 }(each_element)
			} // for loop element in in obj
}
	
	
	
function create_modal_window (modal_id,options){
	//console.log("KH");
	
	if($( "body" ).has( "#"+modal_id ).length==0){
		//console.log("KH2");
		var modal_title=options['title'];
		var style_window=options['style'];
	var append_model='<div id="'+modal_id+'"  class="modal fade"><div class="modal-dialog"  style="'+style_window+'"><div class="modal-content" ><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h4 class="modal-title">'+modal_title+'</h4></div><div class="modal-body" id="'+modal_id+'_content"></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>';
	$("body").append(append_model);
		
		  $("#"+modal_id).draggable({
      handle: ".modal-header"
          });
		   $("#"+modal_id).modal("show");
		  
	}else{
		 $("#"+modal_id).modal("show");
	}
	
}

function leaflet_l(grades,title,dss_class){        
	  
		if($(".bottom_display").length>0){
			$(".bottom_display").remove();
		}
		
		var class_UI;
		if(typeof(dss_class)!='undefined'){
			class_UI=dss_class;
		}else{
			class_UI="";
		}
		
		
		
		if(typeof(grades)!='undefined'){			
			
			$("#map").append("<div class='bottom_display "+class_UI+"'  style='position:absolute; bottom:0px; left:0px; width:100%'></div>"); 
	
			$(".bottom_display").append("<a href='#' class='legend_Button' id='bottom_button' style='color:#000000; position:absolute; top:-25px; right:0'>Switch</a> <div class='bottom_container' style='min-height:250px; width:100%; bottom:0px; padding:10px; float:right; background:#ffffff; border-style: solid; border-color:#808080;'></div>");
		

			$(".bottom_container").append(grades);
		}
		
		
		
		
		var display="yes";
		$('#bottom_button').click(function() {  
		var height=$(".bottom_display").css('height');
		
		var bottom=$(".bottom_display").css('bottom');
        bottom=(Number(bottom.split('px')[0]));		
		if(display=="no"){			
				  $( ".bottom_display" ).animate({
					bottom:0,
				  }, 1500 );
				  display="yes";
		}else{
			       height=(Number(height.split('px')[0]));
				  $( ".bottom_display" ).animate({
					bottom:-height,
				  }, 1500 );
				  display="no";
		}
		
		

		});	
}



function leaflet_legend(grades,title,option,dss_class){       
	  
		if($(".leaflet-legend").length>0){
			$(".leaflet-legend").remove();
		}
		
		var class_UI;
		if(typeof(dss_class)!='undefined'){
			class_UI=dss_class;
		}else{
			class_UI="";
		}
		
		
		
		if(typeof(grades)!='undefined'){
			
			
			$("#map").append("<div class='leaflet-legend "+class_UI+"'  style='position:absolute; bottom:100px; left:0px;'></div>");
			$(".leaflet-legend").append("<div class='info legend legend_container' style='min-height:100px; padding:10px; float:left; background:#ffffff; border-style: solid; border-color:#808080;'></div><a href='#' class='legend_Button retote_vertical' id='legend_button' style='margin-top: -20px; float: right; color:#000000;'>Legend</a>");
		
		var legend_content="";
		if(typeof(grades)=="object"){
		for (var i = 0; i < grades.length-1; i++) {
			
			if(i==0 && typeof(title)!='undefined'){
				legend_content += title;
				
			}
			
			if(typeof(option)!='undefined' && option.length!=0){
				
				var legend_option={
					"range":'<i class="legend" style="background:' + grades[i+1][1] + '"></i> ' + grades[i][0] + (grades[i + 1][0] ? '&ndash;' + grades[i + 1][0] + '<br>' : '+'),
					"discrete":'<i class="legend" style="background:' + grades[i][1] + '"></i> ' + grades[i][0] + (grades[i][0] ? '<br>' : '+'),					
				};
				
			   legend_content += legend_option[option["type"]];
			   
			}else{
			   legend_content +='<i class="legend" style="background:' + grades[i+1][1] + '"></i> ' + grades[i][0] + (grades[i + 1][0] ? '&ndash;' + grades[i + 1][0] + '<br>' : '+');
			}
			
			
		}
		
		
		$(".legend").append(legend_content);
			}else{
				$(".legend").append(grades);
				
			}
		}
		
		
		
		
		var display="yes";
		$('#legend_button').click(function() {  
		var width=$(".legend_container").css('width');
		var left=$(".legend_container").css('left');
        left=(Number(width.split('px')[0]));		
		if(display=="no"){
			
				  $( ".leaflet-legend" ).animate({
					left:0,
				  }, 1500 );
				  display="yes";
		}else{
			       width=(Number(width.split('px')[0]));
				  $( ".leaflet-legend" ).animate({
					left:-width,
				  }, 1500 );
				  display="no";
		}
		
		

		});
		
		/*legend.onAdd = function (map) {
		
		leaflet-bottom leaflet-left

		
		var div = L.DomUtil.create('div', 'info legend'),labels = [];
		
		//div.append("<div>legend</div>");
		
			//grades = [0, 10, 20, 50, 100, 200, 500, 1000],
			//grades = [[0,"#ff9999"],[25,"#ff6666"],[50,"#ff3333"],[75,"#ff0000"],[100,"#cc0000"]];			
			

		// loop through our density intervals and generate a label with a colored square for each interval

		for (var i = 0; i < grades.length-1; i++) {
			div.innerHTML +=
				'<i style="background:' + grades[i+1][1] + '"></i> ' +
				grades[i][0] + (grades[i + 1][0] ? '&ndash;' + grades[i + 1][0] + '<br>' : '+');

		}
		div.innerHTML += '<div>legend</div>'
		return div;
		};
		*/
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function leaflet_layer_highlight(feature,layer,defualt_style,highlight_style){	
layer.on('mouseout', function (e) {		
layer.setStyle(defualt_style);	

});
	
	 layer.on('mouseover', function (e) {
 //this.bringToBack();


	 layer.setStyle(highlight_style);
					});
	
}// JavaScript Document


function leaflet_core__json_to_csv(json_imput){
	var json = json_imput
	var fields = Object.keys(json[0])
	var replacer = function(key, value) { return value === null ? '' : value } 
	var csv = json.map(function(row){
	  return fields.map(function(fieldName){
	    return JSON.stringify(row[fieldName], replacer)
	  }).join(',')
	})
	csv.unshift(fields.join(',')) // add header column
	result=csv.join('\r\n');
	console.log(result)
	return result
}