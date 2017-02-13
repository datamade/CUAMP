$(function() {

 // Filter Options
var ownerOptions = ["Private", "NeighborSpace", "City of Chicago", "Chicago Park District", "Chicago Public Schools", "Chicago Public Library"];
var communityOptions = ["Yes", "No"];
var foodProductionOptions = ["Yes", "No"];
var wardOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"];
// Wrap library inside IFFE for safe variable scoping.
var chicagoGardens = {
  cartoTableName       : 'all_garden_answers',
  cartoUserName        : 'clearstreets',
  locationScope        : 'chicago',
  mapDivName           : 'mapCanvas',
  map                  : null,
  mapCentroid          : new L.LatLng(41.901557, -87.630360),
  defaultZoom          : 11,
  lastClickedLayer     : null,
  geojson              : '',
  currentPinpoint      : '',
  userSelection        : '',
  wardSelections       : '',
  ownerSelections      : '',
  communitySelections  : '',
  productionSelections : '',
  centerMark           : '',
  radiusCircle         : '',
  wardBorder           : '',

  // Create geocoder object to access Google Maps API. Add underscore to insure variable safety.
   _geocoder      : new google.maps.Geocoder(),
    // Turn on autocomplete to predict address when user begins to type.
   _autocomplete  : new google.maps.places.Autocomplete(document.getElementById('search-address')),

  initialize: function(){
    // Initiate leaflet map
    var div = this.mapDivName;
    // var geocoder = new google.maps.Geocoder();
    var satellite = new L.Google('SATELLITE');
    var roadmap = new L.Google('ROADMAP');

    var baseLayers = {
      "Satellite" : satellite,
      "Roadmap" : roadmap
    };

    this.map = new L.Map('mapCanvas', {
      center: this.mapCentroid,
      zoom: this.defaultZoom,
      scrollWheelZoom: false,
      tapTolerance: 30,
      layers: satellite
    });

    L.control.layers(baseLayers).addTo(this.map);
  },

  addInfoBox: function(mapPosition, divName, text) {
      var text = text || ''
      var info = L.control({position: mapPosition});

      info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', divName);
        this._div.innerHTML = text;
        return this._div;
      };

      info.addTo(this.map);
  },

  updateInfoBox: function(infoText, divName) {
    $('html').find("div." + divName).html(infoText);
  },

  clearInfoBox: function(divName) {
    $('html').find("div." + divName).html('');
  },

  createCartoLayer: function() {
    // Input the results from defineSublayer as arguments.
    sublayerArr = []
    for (i = 0; i < arguments.length; i++) {
      sublayerArr.push(arguments[i]);
    }

    var layerOpts = {
      user_name: chicagoGardens.cartoUserName,
      type: 'cartodb',
      cartodb_logo: false,
      sublayers: sublayerArr
    }

    var createdLayer = cartodb.createLayer(chicagoGardens.map, layerOpts, { https: true });

    return createdLayer;
  },

  // runSQL: function() {
  //    // Devise SQL calls for geosearch and language search.
  //   var address = $("#search-address").val();

  //   if(CartoLib.currentPinpoint != null && address != '') {
  //     CartoLib.geoSearch = "ST_DWithin(ST_SetSRID(ST_POINT(" + CartoLib.currentPinpoint[1] + ", " + CartoLib.currentPinpoint[0] + "), 4326)::geography, the_geom::geography, " + CartoLib.radius + ")";
  //   }
  //   else {
  //     CartoLib.geoSearch = ''
  //   }


  //   CartoLib.userSelection = '';
  //   // Gets selected elements in dropdown (represented as an array of objects).
  //   var wardUserSelections = ($("#search-ward").select2('data'))
  //   var ownerUserSelections = ($("#search-ownership").select2('data'))

  //   if ($('#search-community').is(':checked')) {
  //     var communityUserSelections = 'true';
  //   }
  //   else {
  //     var communityUserSelections = 'false';
  //   }

  //   if ($('#search-production').is(':checked')) {
  //     var productionUserSelections = 'true';
  //   }
  //   else {
  //     var productionUserSelections = 'false';
  //   }

  //   var userSelection = [wardUserSelections, ownerUserSelections, communityUserSelections, productionUserSelections];

  // },

  setZoom: function(radius) {
    var zoom = '';
    if (radius >= 8050) zoom = 12; // 5 miles
    else if (radius >= 3220) zoom = 13; // 2 miles
    else if (radius >= 1610) zoom = 14; // 1 mile
    else if (radius >= 805) zoom = 15; // 1/2 mile
    else if (radius >= 400) zoom = 16; // 1/4 mile
    else zoom = 16;

    this.map.setView(new L.LatLng( this.currentPinpoint[0], this.currentPinpoint[1] ), zoom)
  },

  clearSearch: function(){
    if (CartoDbLib.sublayer) {
      CartoDbLib.sublayer.remove();
    }
    if (CartoDbLib.centerMark)
      CartoDbLib.map.removeLayer( CartoDbLib.centerMark );
    if (CartoDbLib.radiusCircle)
      CartoDbLib.map.removeLayer( CartoDbLib.radiusCircle );
  },


  addUnderscore: function(text) {
    var newText = text.replace(/\s/g, '_').replace(/[\/]/g, '_').replace(/[\:]/g, '')
    return newText.toLowerCase();
  },

  addIcon: function() {
    this.centerMark = new L.Marker(this.currentPinpoint, {
      icon: (new L.Icon({
        iconUrl: 'images/push_pin.png',
        iconSize: [30, 30],
        iconAnchor: [10, 32]
        })
      )
    });

    this.centerMark.addTo(this.map);
  },

  addCircle: function(radius) {
    this.radiusCircle = new L.circle(this.currentPinpoint, radius, {
        fillColor:'#8A2B85',
        fillOpacity:'0.4',
        stroke: false,
        clickable: false
    });

    this.radiusCircle.addTo(this.map);
  },

  clearSearch: function() {
    if (this.centerMark)
      this.map.removeLayer(this.centerMark);
    if (this.radiusCircle)
      this.map.removeLayer(this.radiusCircle);
  },

  doSearch: function() {
    this.clearSearch();
    var gardenMap = this;
    // // #search-address refers to a div id in map-example.html. You can rename this div.
    var address = $("#search-address").val();
    var radius = $("#search-radius").val();
    // var ward_number = $("#search-ward").val();
    var owner = $("#search-ownership").select2('data');
    var ownerSQL = this.userSelectionSQL(owner)
    // var community_garden = $("#search-community").val();
    var food_production = $("#search-production").val();

    if (food_production) {
      var foodSQL = ' WHERE food_production = true';
    }

    var whereClause = " WHERE the_geom is not null";
    var location = gardenMap.locationScope;

    if (radius == null && address != "") {
      radius = 8050;
    }

    if (address != "") {
      console.log('address')
      gardenMap._geocoder.geocode( { 'address' : address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
         gardenMap.currentPinpoint = [results[0].geometry.location.lat(), results[0].geometry.location.lng()];
          var geoSearch = "ST_DWithin(ST_SetSRID(ST_POINT(" + gardenMap.currentPinpoint[1] + ", " + gardenMap.currentPinpoint[0] + "), 4326)::geography, the_geom::geography, " + radius + ")";
          whereClause += " AND " + geoSearch + foodSQL
          console.log(whereClause)

          // var path = $.address.value();
          // var parameters = {
          //   "address": gardenMap.address,
          //   "radius": gardenMap.radius,
          //   "ward": gardenMap.wardSelections,
          //   "owner": gardenMap.ownerSelections,
          //   "community": gardenMap.communitySelections,
          //   "production": gardenMap.productionSelections,
          //   "path": path
          // }

          // gardenMap.prototype.runSQL();
          // $.address.parameter('ward', gardenMap.wardSelections);
          // $.address.parameter('owner', gardenMap.ownerSelections);
          // $.address.parameter('community', gardenMap.communitySelections);
          // $.address.parameter('production', gardenMap.productionSelections);

          gardenMap.setZoom(radius);
          gardenMap.addIcon();
          gardenMap.addCircle(radius);
        }
        else {
          alert("We could not find your address: " + status);
        }
      });
    }

    // if (ward_number != null) {
    //   var sql_query = "SELECT ward_addr FROM table_2015_ward_offices WHERE ward=" + ward_number;
    //   var sql = new cartodb.SQL({ user:'clearstreets' });
    //   var searcher = gardenMap._geocoder
    //   sql.execute(sql_query).done(function (data){

    //     content = data.rows[0].ward_addr
    //     searcher.geocode( { 'address' : content }, function(results, status) {
    //       if (status == google.maps.GeocoderStatus.OK) {
    //         gardenMap.currentPinpoint = [results[0].geometry.location.lat(), results[0].geometry.location.lng()]
    //         var geoFind = "ST_SetSRID(ST_POINT(" + gardenMap.currentPinpoint[1] + ", " + gardenMap.currentPinpoint[0] + "), 8050)";

    //         radius = 8050;

    //         gardenMap.addIcon();
    //         gardenMap.setZoom(radius);

    //       }

    //       else {
    //         alert("We could not find your ward")
    //       };
    //     })
    //   })
    // }

    // if {
    //   // gardenMap.map.setView(gardenMap.mapCentroid, gardenMap.defaultZoom)
    //   // var parameters = {
    //   //   "address": gardenMap.address,
    //   //   "radius": gardenMap.radius,
    //   //   "ward": gardenMap.wardSelections,
    //   //   "owner": gardenMap.ownerSelections,
    //   //   "community": gardenMap.communitySelections,
    //   //   "production": gardenMap.productionSelections
    //   // }

    //   gardenMap.prototype.runSQL();

    //   // $.address.parameter('ward', gardenMap.wardSelections);
    //   // $.address.parameter('owner', gardenMap.ownerSelections);
    //   // $.address.parameter('community', gardenMap.communitySelections);
    //   // $.address.parameter('production', gardenMap.productionSelections);

    //   // gardenMap.setZoom(radius);
    //   // gardenMap.addIcon();
    //   // gardenMap.addCircle(radius);
  },

  userSelectionSQL: function(array) {
  var results = '';
  $.each( array, function(index, obj) {
    chicagoGardens.userSelection += " AND LOWER(" + chicagoGardens.addUnderscore(obj.text) + ") = 'true'"
    results += (obj.text + ", ")
  })

  return results
  },
}




  // Create a map!
chicagoGardens.initialize();
chicagoGardens.addInfoBox('bottomright', 'infoBox');

var layer1 = {
  sql: "select * from all_garden_answers",
  cartocss: $('#carto-result-style').html().trim(),
  interactivity: 'food_producing, community_garden, ownership, garden_address, growing_site_name, the_geom',
}

var layer2 = {
  sql: "SELECT * FROM boundaries_for_wards_2015", 
  cartocss: $('#carto-result-style2').html().trim()
};

chicagoGardens.createCartoLayer(layer1).addTo(chicagoGardens.map)
    .done(function(layer) {
      var mapName = "#" + chicagoGardens.mapDivName + " div"
      layerZero = layer.getSubLayer(0);
      layerZero.setInteraction(true);

      layerZero.on('featureOver', function(e, latlng, pos, data, subLayerIndex) {
          $(mapName).css('cursor','pointer');
          ownership        = ''
          food_producing   = ''
          community_garden = ''
          site_name        = "<h4>" + data.growing_site_name + "</h4>"
          address          = "<p><i class='fa fa-map-marker' aria-hidden='true'></i> " + data.garden_address + "</p>"

          html = site_name + address + ownership + food_producing

          chicagoGardens.updateInfoBox(html, "infoBox");
      });

      layerZero.on('featureOut', function() {
          $(mapName).css('cursor','inherit');
          chicagoGardens.clearInfoBox("infoBox");
      });

      layerZero.on('featureClick', function(e, latlng, pos, data, subLayerIndex){
          modalPop(data);
      });

    });
    
    $(".close-btn").on('click', function() {
      modalPop(null);
    });

    $("#btnSearch").on("click", function() {
      chicagoGardens.doSearch();
    });

    $("#btnReset").on("click", function() {
      chicagoGardens.clearSearch();
    });


  $('#search-ward, #search-ownership').select2();

  var ward_data = makeSelectData(wardOptions);
  var ownership_data = makeSelectData(ownerOptions);

  $(".data-array-ward").select2({
    placeholder: "Ward",
    data: ward_data
  });

  $(".data-array-ownership").select2({
    placeholder: "Owner",
    data: ownership_data
  });

  function makeSelectData(array) {
    data_arr = []
    for(var i = 0; i < array.length; i++) {
      data_arr.push({ id: i, text: array[i]})
    }
    return data_arr
  };

//   function convertBoolean(text) {
//     if (text.toLower() == "Yes")
//       return "true"
//     else {
//       return "false"
//     }
//   }




  function modalPop(data) {
    var contact = "<p id='modal-address'><i class='fa fa-map-marker' aria-hidden='true'></i> <strong>Address:</strong> " + data.garden_address + '</p><br>' + '<p class="modal-directions"><a href="http://maps.google.com/?q=' + data.garden_address + '" target="_blank">Get Directions</a></p>'
    $('#modal-pop').appendTo('body').modal();
    $('#modal-title, #address-header, #owner-header, #community-header, #production-header, #address-subsection, #owner-subsection, #community-subsection, #production-subsection').empty();
    $('#modal-title').html(data.growing_site_name);
    $('#modal-main').html(contact);


    var address_list = data.garden_address
    var owner_list = data.ownership
    var community_list = data.community_garden
    var production_list = data.food_producing
    // Find all instances of "yes."
    if (address_list != null) {
        $("#address-header").append('<i class="fa fa-user" aria-hidden="true"></i> Address:');
        $("#address-subsection").append("<p>" + address_list + "</p>");
    } 
    if (owner_list != null) {
        $("#owner-header").append('<i class="fa fa-usd" aria-hidden="true"></i> Ownership:');
        $("#owner-subsection").append("<p>" + owner_list + "</p>");
    }
    if (community_list != null) {
      $("#community-header").append('<i class="fa fa-users" aria-hidden="true"></i> Community Garden:');
      $("#community-subsection").append("<p>" + community_list + "</p>");
    }
    if (production_list != null) {
      $("#production-header").append('<i class="fa fa-cutlery" aria-hidden="true"></i> Food Producing:');
      $("#production-subsection").append("<p>" + production_list + "</p>")
    }
  };



  
});
