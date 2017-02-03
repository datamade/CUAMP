 // Filter Options
var ownerOptions = ["Private", "NeighborSpace", "City of Chicago", "Chicago Park District", "Chicago Public Schools", "Chicago Public Library"];
var communityOptions = ["Yes", "No"];
var foodProductionOptions = ["Yes", "No"];
var wardOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"];
// Wrap library inside IFFE for safe variable scoping.
CartoLib = (function() {
// Declaration of CartoLib function.
  function CartoLib() {
    // Quick variable reference to map settings.
    this.cartoTableName       = '';
    this.cartoUserName        = '';
    this.locationScope        = 'chicago';
    this.mapDivName           = '';
    this.map                  = null;
    this.mapCentroid          = new L.LatLng(41.901557, -87.630360),
    this.defaultZoom          = 11;
    this.lastClickedLayer     = null;
    this.geojson              = '';
    this.fields               = '';
    this.currentPinpoint      = '';
    this.userSelection        = '';
    this.wardSelections       = '';
    this.ownerSelections      = '';
    this.communitySelections  = '';
    this.productionSelections = '';
    this.centerMark           = '';
    this.radiusCircle         = '';
    this.wardBorder           = '';
    // Create geocoder object to access Google Maps API. Add underscore to insure variable safety.
    this._geocoder      = new google.maps.Geocoder();
    // Turn on autocomplete to predict address when user begins to type.
    this._autocomplete  = new google.maps.places.Autocomplete(document.getElementById('search-address'));
  }

  // Give CartoLib its behaviors.
  CartoLib.prototype.initiateMap = function() {
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
  }

  CartoLib.prototype.addInfoBox = function(mapPosition, divName, text) {
      var text = text || ''
      var info = L.control({position: mapPosition});

      info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', divName);
        this._div.innerHTML = text;
        return this._div;
      };

      info.addTo(this.map);
  }

  CartoLib.prototype.updateInfoBox = function(infoText, divName) {
    $('html').find("div." + divName).html(infoText);
  }

  CartoLib.prototype.clearInfoBox = function(divName) {
    $('html').find("div." + divName).html('');
  }

  CartoLib.prototype.createCartoLayer = function() {
    // Input the results from defineSublayer as arguments.
    sublayerArr = []
    for (i = 0; i < arguments.length; i++) {
      sublayerArr.push(arguments[i]);
    }

    var layerOpts = {
      user_name: this.cartoUserName,
      type: 'cartodb',
      cartodb_logo: false,
      sublayers: sublayerArr
    }

    var createdLayer = cartodb.createLayer(this.map, layerOpts, { https: true });

    return createdLayer;
  }

  CartoLib.prototype.defineSublayer = function(sqlQuery, cartoCSSId) {

    var layer = {
      sql: sqlQuery,
      cartocss: $(cartoCSSId).html().trim(),
      interactivity: this.fields
    }

    return layer
  }


  // CartoLib.prototype.userSelectionSQL = function(array) {
  //   var results = '';
  //   $.each( array, function(index, obj) {
  //     userSelection += " AND LOWER(" + CartoDbLib.addUnderscore(obj.text) + ") LIKE '%yes%'"
  //     results += (obj.text + ", ")
  //   })

  //   return results
  // },


  CartoLib.prototype.runSQL = function() {
     // Devise SQL calls for geosearch and language search.
    var address = $("#search-address").val();

    if(CartoLib.currentPinpoint != null && address != '') {
      CartoLib.geoSearch = "ST_DWithin(ST_SetSRID(ST_POINT(" + CartoLib.currentPinpoint[1] + ", " + CartoLib.currentPinpoint[0] + "), 4326)::geography, the_geom::geography, " + CartoLib.radius + ")";
    }
    else {
      CartoLib.geoSearch = ''
    }


    CartoLib.userSelection = '';
    // Gets selected elements in dropdown (represented as an array of objects).
    var wardUserSelections = ($("#search-ward").select2('data'))
    var ownerUserSelections = ($("#search-ownership").select2('data'))

    if ($('#search-community').is(':checked')) {
      var communityUserSelections = 'true';
    }
    else {
      var communityUserSelections = 'false';
    }

    if ($('#search-production').is(':checked')) {
      var productionUserSelections = 'true';
    }
    else {
      var productionUserSelections = 'false';
    }

    var userSelection = [wardUserSelections, ownerUserSelections, communityUserSelections, productionUserSelections];
    console.log(userSelection)

  };

  CartoLib.prototype.setZoom = function(radius) {
    var zoom = '';
    if (radius >= 8050) zoom = 12; // 5 miles
    else if (radius >= 3220) zoom = 13; // 2 miles
    else if (radius >= 1610) zoom = 14; // 1 mile
    else if (radius >= 805) zoom = 15; // 1/2 mile
    else if (radius >= 400) zoom = 16; // 1/4 mile
    else zoom = 16;

    this.map.setView(new L.LatLng( this.currentPinpoint[0], this.currentPinpoint[1] ), zoom)
  };

  // CartoLib.prototype.doSearch = function() {
  //   this.clearSearch();

  //   var cartoLib = this;
  //   // #search-address refers to a div id in map-example.html. You can rename this div.
  //   var address = $("#search-address").val();
  //   var radius = $("#search-radius").val();
  //   var ward_number = $("#search-ward").val();
  //   var owner = $("#search-ownership").val();
  //   var community_garden = $("#search-community").val();
  //   var food_production = $("#search-production").val();
  //   var location = this.locationScope;

  //   if (radius == null && address != "") {
  //     radius = 8050;
  //   }

  //   if (address != "") {
  //     this._geocoder.geocode( { 'address' : address }, function(results, status) {
  //       if (status == google.maps.GeocoderStatus.OK) {
  //        cartoLib.currentPinpoint = [results[0].geometry.location.lat(), results[0].geometry.location.lng()];
  //         var geoSearch = "ST_DWithin(ST_SetSRID(ST_POINT(" + cartoLib.currentPinpoint[1] + ", " + cartoLib.currentPinpoint[0] + "), 4326)::geography, the_geom::geography, " + radius + ")";
  //         var whereClause = " WHERE the_geom is not null AND " + geoSearch;

  //         var path = $.address.value();
  //         var parameters = {
  //           "address": CartoLib.address,
  //           "radius": CartoLib.radius,
  //           "ward": CartoLib.wardSelections,
  //           "owner": CartoLib.ownerSelections,
  //           "community": CartoLib.communitySelections,
  //           "production": CCartoLib.productionSelections,
  //           "path": path
  //         }

  //         CartoLib.prototype.runSQL();
  //         $.address.parameter('ward', CartoLib.wardSelections);
  //         $.address.parameter('owner', CartoLib.ownerSelections);
  //         $.address.parameter('community', CartoLib.communitySelections);
  //         $.address.parameter('production', CartoLib.productionSelections);

  //         cartoLib.setZoom(radius);
  //         cartoLib.addIcon();
  //         cartoLib.addCircle(radius);
  //       }
  //       else {
  //         alert("We could not find your address: " + status);
  //       }
  //     });
  //   }

  //   if (ward_number != null) {
  //     var sql_query = "SELECT ward_addr FROM table_2015_ward_offices WHERE ward=" + ward_number;
  //     var sql = new cartodb.SQL({ user:'clearstreets' });
  //     var searcher = this._geocoder
  //     sql.execute(sql_query).done(function (data){

  //       content = data.rows[0].ward_addr
  //       searcher.geocode( { 'address' : content }, function(results, status) {
  //         if (status == google.maps.GeocoderStatus.OK) {
  //           cartoLib.currentPinpoint = [results[0].geometry.location.lat(), results[0].geometry.location.lng()]
  //           var geoFind = "ST_SetSRID(ST_POINT(" + cartoLib.currentPinpoint[1] + ", " + cartoLib.currentPinpoint[0] + "), 8050)";

  //           radius = 8050;

  //           cartoLib.addIcon();
  //           cartoLib.setZoom(radius);

  //         }

  //         else {
  //           alert("We could not find your ward")
  //         };
  //       })
  //     })
  //   }

  //   else {
  //     this.map.setView(this.mapCentroid, this.defaultZoom)
  //     // var parameters = {
  //     //   "address": CartoLib.address,
  //     //   "radius": CartoLib.radius,
  //     //   "ward": CartoLib.wardSelections,
  //     //   "owner": CartoLib.ownerSelections,
  //     //   "community": CartoLib.communitySelections,
  //     //   "production": CartoLib.productionSelections
  //     // }

  //     CartoLib.prototype.runSQL();

  //     // $.address.parameter('ward', CartoLib.wardSelections);
  //     // $.address.parameter('owner', CartoLib.ownerSelections);
  //     // $.address.parameter('community', CartoLib.communitySelections);
  //     // $.address.parameter('production', CartoLib.productionSelections);

  //     cartoLib.setZoom(radius);
  //     cartoLib.addIcon();
  //     cartoLib.addCircle(radius);
  //   }
  
  // };

  CartoLib.prototype.addUnderscore = function() {
    var newText = this.text.replace(/\s/g, '_').replace(/[\/]/g, '_').replace(/[\:]/g, '')
    if (newText[0].match(/^[1-9]\d*/)) {
      newText = "_" + newText
    }
    if (newText.includes("True")) {
      newText = "Yes"
    }
    if (newText.includes("False")) {
      newText = "No"
    }
    return newText.toLowerCase();
  };

  CartoLib.prototype.addIcon = function() {
    this.centerMark = new L.Marker(this.currentPinpoint, {
      icon: (new L.Icon({
        iconUrl: 'images/push_pin.png',
        iconSize: [30, 30],
        iconAnchor: [10, 32]
        })
      )
    });

    this.centerMark.addTo(this.map);
  }

  CartoLib.prototype.addCircle = function(radius) {
    this.radiusCircle = new L.circle(this.currentPinpoint, radius, {
        fillColor:'#8A2B85',
        fillOpacity:'0.4',
        stroke: false,
        clickable: false
    });

    this.radiusCircle.addTo(this.map);
  }

  CartoLib.prototype.clearSearch = function() {
    if (this.centerMark)
      this.map.removeLayer(this.centerMark);
    if (this.radiusCircle)
      this.map.removeLayer(this.radiusCircle);
  }

  return CartoLib;
})();
