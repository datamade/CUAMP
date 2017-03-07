var chicagoGardens;
$(function() {

 // Filter Options
var ownerOptions = ["Private", "NeighborSpace", "City of Chicago", "Chicago Park District", "Chicago Public Schools", "Chicago Public Library"];
var communityOptions = ["Yes", "No"];
var foodProductionOptions = ["Yes", "No"];
var wardOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"];
var districtOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17"];
var commareaOptions = ["ALBANY PARK", "ARCHER HEIGHTS", "ARMOUR SQUARE", "ASHBURN", "AUBURN GRESHAM", "AUSTIN", "AVALON PARK", "AVONDALE", "BELMONT CRAGIN", "BEVERLY", "BRIDGEPORT", "BRIGHTON PARK", "BURNSIDE", "CALUMET HEIGHTS", "CHATHAM", "CHICAGO LAWN", "CLEARING", "DOUGLAS", "DUNNING", "EAST GARFIELD PARK", "EAST SIDE", "EDGEWATER", "EDISON PARK", "ENGLEWOOD", "FULLER PARK", "GAGE PARK", "GARFIELD RIDGE", "GRAND BOULEVARD", "GREATER GRAND CROSSING", "HEGEWISCH", "HERMOSA", "HUMBOLDT PARK", "HYDE PARK", "IRVING PARK", "KENWOOD", "LAKE VIEW", "LINCOLN SQUARE", "LOGAN SQUARE", "LOOP", "LOWER WEST SIDE", "MCKINLEY PARK", "MONTCLARE", "MORGAN PARK", "MOUNT GREENWOOD", "NEAR WEST SIDE", "NEW CITY", "NORTH CENTER", "NORTH LAWNDALE", "NORTH PARK", "OAKLAND", "PORTAGE PARK", "PULLMAN", "RIVERDALE", "ROGERS PARK", "ROSELAND", "SOUTH DEERING", "SOUTH LAWNDALE", "WASHINGTON HEIGHTS", "WASHINGTON PARK", "WEST ELSDON", "WEST ENGLEWOOD", "WEST GARFIELD PARK", "WEST LAWN", "WEST PULLMAN", "WEST RIDGE", "WEST TOWN", "WOODLAWN"]
// Wrap library inside IFFE for safe variable scoping.
chicagoGardens = {
  cartoTableName       : 'allpublicgardendata',
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
  filterAddress        : '',
  sublayerOne          : '',
  sublayerWards        : '',
  sublayerCommunities  : '',
  sublayerDistricts    : '',
  whereClause          : '',
  joinClause           : '',
  ward_number          : '',
  district_number      : '',
  neighborhood         : '',
  wardSQL              : '',
  districtSQL          : '',
  communityareaSQL     : '',
  gardenSQL            : '',
  resultsNumber        : '',
  cartoFields          : 'the_geom, the_geom_webmercator, growing_site_name, is_growing_site_locked, evidence_of_support_organizations, if_it_s_a_community_garden_is_it_collective_or_allotment, choose_growing_site_types, water, compost_system, structures_and_features, season_extension_techniques, animals, address, food_producing, community_garden, is_growing_site_dormant, latitude, longitude, ownership, other_support_organization, growing_site_website, facebook, is_growing_site_fenced, description, ward, communities, public_contact_info, growing_site_image, municipalities',

  // Create geocoder object to access Google Maps API. Add underscore to insure variable safety.
   _geocoder      : new google.maps.Geocoder(),
    // Turn on autocomplete to predict address when user begins to type.
   _autocomplete  : new google.maps.places.Autocomplete(document.getElementById('search-address')),

  initialize: function(){
    // Initiate leaflet map
    var div = this.mapDivName;
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
    this.renderMap();
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

  addUnderscore: function(text) {
    var newText = text.replace(/\s/g, '_').replace(/[\/]/g, '_').replace(/[\:]/g, '')
    return newText.toLowerCase();
  },

  addIcon: function() {
    this.centerMark = new L.Marker(this.currentPinpoint, {
      icon: (new L.Icon({
        iconUrl: 'images/map_marker.png',
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
    if (this.whereClause)
      this.whereClause = "";
    if (this.sublayerCommunities)
      this.sublayerCommunities.remove();
    if (this.sublayerWards)
      this.sublayerWards.remove();
    if (this.sublayerDistricts)
      this.sublayerDistricts.remove();
    if (this.sublayerOne)
      this.sublayerOne.remove();
    if (this.centerMark)
      this.map.removeLayer(this.centerMark);
    if (this.radiusCircle)
      this.map.removeLayer(this.radiusCircle);

  },

  doSearch: function() {
    this.clearSearch();
    chicagoGardens.whereClause = " WHERE gardens.the_geom is not null";
    var gardenMap = this;
    // // #search-address refers to a div id in map-example.html. You can rename this div.
    chicagoGardens.filterAddress = $("#search-address").val();
    var radius = $("#search-radius").val();
    chicagoGardens.ward_number = $("#search-ward").select2('data');
    chicagoGardens.district_number = $("#search-district").select2('data');
    var owner = $("#search-ownership").select2('data');
    chicagoGardens.neighborhood = $("#search-neighborhood").select2('data');
    var ownerSQL = this.ownerSelectionSQL(owner)
    chicagoGardens.communityareaSQL = "community_areas.community IN (" + this.multipleSelectionSQL(chicagoGardens.neighborhood) + ")"
    chicagoGardens.wardSQL = "wards.ward IN (" + this.multipleSelectionSQL(chicagoGardens.ward_number) + ")"
    chicagoGardens.districtSQL = "districts.district_n IN (" + this.multipleSelectionSQL(chicagoGardens.district_number) + ")"

    if (owner != '') {
      chicagoGardens.whereClause += ' AND (' + ownerSQL + ')'
    }

    if ($('#search-production').is(':checked')) {
      chicagoGardens.whereClause += ' AND gardens.food_producing = true'
    }

    if ($('#search-community').is(':checked')) {
      chicagoGardens.whereClause += ' AND gardens.community_garden = true'
    }

    var location = gardenMap.locationScope;

    if (radius == null && address != "") {
      radius = 8050;
    }

    if (chicagoGardens.filterAddress != "") {
      gardenMap._geocoder.geocode( { 'address' : chicagoGardens.filterAddress }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
         gardenMap.currentPinpoint = [results[0].geometry.location.lat(), results[0].geometry.location.lng()];
          var geoSearch = "ST_DWithin(ST_SetSRID(ST_POINT(" + gardenMap.currentPinpoint[1] + ", " + gardenMap.currentPinpoint[0] + "), 4326)::geography, gardens.the_geom::geography, " + radius + ")";
          chicagoGardens.whereClause += " AND " + geoSearch

          chicagoGardens.setZoom(radius);
          chicagoGardens.addIcon();
          chicagoGardens.addCircle(radius);
          chicagoGardens.renderMap();
        }
        else {
          alert("We could not find your address: " + status);
        }
      });
    }

    else if (chicagoGardens.neighborhood != '') {
      chicagoGardens.joinClause = " join boundaries_community_areas_current as community_areas on ST_Intersects(gardens.the_geom, community_areas.the_geom)"
      chicagoGardens.whereClause += " AND " + chicagoGardens.communityareaSQL
    }

    else if (chicagoGardens.ward_number != '') {
      chicagoGardens.joinClause = " join boundaries_for_wards_2015 as wards on ST_Intersects(gardens.the_geom, wards.the_geom)"
      chicagoGardens.whereClause += " AND " + chicagoGardens.wardSQL
    }

    else if (chicagoGardens.district_number != '') {
      chicagoGardens.joinClause = " join ccgisdata_commissioner_districts_current as districts on ST_Intersects(gardens.the_geom, districts.the_geom)"
      chicagoGardens.whereClause += " AND " + chicagoGardens.districtSQL
    }

    if (chicagoGardens.filterAddress == "") {
      chicagoGardens.renderMap();
    }
  },

  renderMap: function() {
    chicagoGardens.gardenSQL = "select gardens.* from allpublicgardendata as gardens" + chicagoGardens.joinClause + " " + chicagoGardens.whereClause;

    communityLayerSQL = "SELECT community_areas.* from boundaries_community_areas_current as community_areas WHERE community_areas.community = 'WICKER PARK'"
      if (chicagoGardens.neighborhood != '' && chicagoGardens.filterAddress == "") {
        communityLayerSQL += "OR " + chicagoGardens.communityareaSQL;
      }
    wardLayerSQL = "SELECT wards.* from boundaries_for_wards_2015 as wards WHERE wards.ward = '51'"
      if (chicagoGardens.ward_number != "" && chicagoGardens.neighborhood == "" && chicagoGardens.filterAddress == "") {
          wardLayerSQL += "OR " + chicagoGardens.wardSQL;
      }
    districtLayerSQL = "SELECT districts.* from ccgisdata_commissioner_districts_current as districts WHERE districts.district_n = '18'"
      if (chicagoGardens.district_number != "" && chicagoGardens.neighborhood == "" && chicagoGardens.filterAddress == "" && chicagoGardens.ward_number == "") {
          districtLayerSQL += "OR " + chicagoGardens.districtSQL;
      }

    var sql = new cartodb.SQL({  user: chicagoGardens.cartoUserName  });
    sql.execute(chicagoGardens.gardenSQL).done(function (data) {
      entries = data.rows
      chicagoGardens.resultsNumber = entries.length
      chicagoGardens.clearInfoBox("resultsBox");
      chicagoGardens.updateInfoBox("Sites Found: <strong>" + chicagoGardens.resultsNumber + "</strong>", "resultsBox");
    })

    layerOpts = {
      user_name: chicagoGardens.cartoUserName,
      type: 'cartodb',
      cartodb_logo: false,
      sublayers: [
        {
          sql: wardLayerSQL,
          cartocss: $('#carto-overlay-style').html().trim(),
        },

        {
          sql: communityLayerSQL,
          cartocss: $('#carto-overlay-style').html().trim(),
        },

        {
          sql: districtLayerSQL,
          cartocss: $('#carto-overlay-style').html().trim(),
        },

        {
          sql: chicagoGardens.gardenSQL,
          cartocss: $('#carto-result-style').html().trim(),
          interactivity: this.cartoFields,
        }
      ]
    }
    var createdLayer = cartodb.createLayer(chicagoGardens.map, layerOpts, { https: true });

    createdLayer.addTo(chicagoGardens.map)
    .done(function(layer) {
      var mapName = "#" + chicagoGardens.mapDivName + " div"
      chicagoGardens.sublayerOne = layer.getSubLayer(3);
      chicagoGardens.sublayerOne.setInteraction(true);
      chicagoGardens.sublayerWards = layer.getSubLayer(0);
      chicagoGardens.sublayerCommunities = layer.getSubLayer(1);
      chicagoGardens.sublayerDistricts = layer.getSubLayer(2);

      chicagoGardens.sublayerOne.on('featureOver', function(e, latlng, pos, data, subLayerIndex) {
          $(mapName).css('cursor','pointer');
          ownership        = ''
          food_producing   = ''
          community_garden = ''
          site_name        = "<h4>" + data.growing_site_name + "</h4>"
          address          = "<p><i class='fa fa-map-marker' aria-hidden='true'></i> " + data.address + "</p>"

          html = site_name + address + ownership + food_producing

          chicagoGardens.updateInfoBox(html, "infoBox");
      });

      chicagoGardens.sublayerOne.on('featureOut', function() {
          $(mapName).css('cursor','inherit');
          chicagoGardens.clearInfoBox("infoBox");
      });

      chicagoGardens.sublayerOne.on('featureClick', function(e, latlng, pos, data, subLayerIndex) {
          modalPop(data);
      });
    });

    if ((chicagoGardens.ward_number != "" || chicagoGardens.neighborhood != "" || chicagoGardens.district_number != "") && chicagoGardens.filterAddress == "") {
      var sql2 = new cartodb.SQL({ user: chicagoGardens.cartoUserName  });
      sql2.getBounds(chicagoGardens.gardenSQL)
        .done(function(bounds) {
           chicagoGardens.map.fitBounds(bounds, {padding: [20,20], maxZoom: 14})
        });
    }
    if (chicagoGardens.ward_number == "" && chicagoGardens.neighborhood == "" && chicagoGardens.filterAddress == "") {
      this.map.setView(chicagoGardens.mapCentroid, 11);
    }

  },


  ownerSelectionSQL: function(array) {
  var results = '';
  $.each( array, function(index, obj) {
    results += ("gardens.ownership = '" + obj.text + "' OR ")
  })

  results_final = results.substring(0, results.length -4);
  return results_final
  },

  multipleSelectionSQL: function(array) {
  var results = '';
  $.each( array, function(index, obj) {
    results += ("'" + obj.text + "', ")
  })

  results_final2 = results.substring(0, results.length -2);
  return results_final2
  },

}

  // Create a map!
chicagoGardens.initialize();
chicagoGardens.addInfoBox('bottomright', 'infoBox');
chicagoGardens.addInfoBox('topright', 'resultsBox', "Sites Found: <strong>" + chicagoGardens.resultsNumber + "</strong>");

var layer1 = {
  sql: "SELECT * from allpublicgardendata",
  cartocss: $('#carto-result-style').html().trim(),
  interactivity: this.cartoFields,
}

    $(".close-btn").on('click', function() {
      modalPop(null);
    });

    $("#btnSearch").on("click", function() {
      chicagoGardens.doSearch();
    });

    $("#btnReset").on("click", function() {
      chicagoGardens.clearSearch();
    });

  $('#search-ownership, #search-ward, #search-neighborhood').select2();

  console.log(layer1)

  var ward_data = makeSelectData(wardOptions);
  var ownership_data = makeSelectData(ownerOptions);
  var commarea_data = makeSelectData(commareaOptions);
  var district_data = makeSelectData(districtOptions);

  $(".data-array-ward").select2({
    placeholder: "Ward",
    data: ward_data
  });

  $(".data-array-district").select2({
    placeholder: "District",
    data: district_data
  });


  $(".data-array-ownership").select2({
    placeholder: "Owner",
    data: ownership_data
  });

  $(".data-array-neighborhood").select2({
    placeholder: "Community Area",
    data: commarea_data
  });

  function makeSelectData(array) {
    data_arr = []
    for(var i = 0; i < array.length; i++) {
      data_arr.push({ id: i, text: array[i]})
    }
    return data_arr
  };


  function convertBoolean(text) {
    if (text == true) {
      return "<i class="+"'fa fa-check'"+" aria-hidden="+"'true'"+"></i>"
    }
    else if (text == false) {
      return "<i class="+"'fa fa-times'"+" aria-hidden="+"'true'"+"></i>"
    }
    else {
    }
  }

  function modalPop(data) {
    var contact = "<p id='modal-address'><i class='fa fa-map-marker' aria-hidden='true'></i> <strong>Address:</strong> " + data.address + '</p><br>' + '<p class="modal-directions"><a href="http://maps.google.com/?q=' + data.address + '" target="_blank">Get Directions</a></p>'
    $('#modal-pop').appendTo('body').modal();
    $('#modal-title, #address-header, #owner-header, #community-header, #production-header, #address-subsection, #owner-subsection, #community-subsection, #production-subsection, #locked-header, #locked-subsection, #commtype-header, #commtype-subsection, #types-header, #types-subsection, #water-header, #water-subsection, #compost-header, #compost-subsection, #structures-header, #structures-subsection, #seasonex-header, #seasonex-subsection, #animal-header, #animal-subsection, #dormant-header, #dormant-subsection, #support-header, #support-subsection, #website-header, #website-subsection, #facebook-header, #facebook-subsection, #fence-header, #fence-subsection, #description-header, #description-subsection, #ward-header, #ward-subsection, #commarea-header, #commarea-subsection, #contact-header, #contact-subsection, #with_contact, #with_location, #with_about, #with_features').empty();
    $('#modal-title').html(data.growing_site_name);
    $('#modal-main').html(contact);

    var address_list = data.address
    var owner_list = data.ownership
    var community_list = data.community_garden
    var production_list = data.food_producing
    var locked = data.is_growing_site_locked
    var comm_garden_type = data.if_it_s_a_community_garden_is_it_collective_or_allotment
    var types = data.choose_growing_site_types
    var water_system = data.water
    var compost = data.compost_system
    var structures = data.structures_and_features
    var season_extension = data.season_extension_techniques
    var animals = data.animals
    var dormant = data.is_growing_site_dormant
    var other_support = data.other_support_organization
    var website = data.growing_site_website
    var facebook = data.facebook
    var fence = data.is_growing_site_fenced
    var description = data.description
    var ward_num = data.ward
    var community_area = data.communities
    var contact_info = data.public_contact_info

    // Find all instances of "yes."
    if (address_list != null) {
        $("#address-header").append('<i class="fa fa-user" aria-hidden="true"></i> Address:');
        $("#address-subsection").append("<p>" + address_list + "</p>");
    } 
    if (owner_list != "") {
        $("#owner-header").append('<i class="fa fa-usd" aria-hidden="true"></i> Ownership:');
        $("#owner-subsection").append("<p>" + owner_list + "</p>");
    }
    if (community_list != null) {
      $("#community-header").append('<i class="fa fa-users" aria-hidden="true"></i> Community Garden:');
      $("#community-subsection").append("<p>" + convertBoolean(community_list) + "</p>");
    }
    if (production_list != null) {
      $("#production-header").append('<i class="fa fa-cutlery" aria-hidden="true"></i> Food Producing:');
      $("#production-subsection").append("<p>" + convertBoolean(production_list) + "</p>")
    }
    if (locked != null) {
      $("#locked-header").append('<i class="fa fa-lock" aria-hidden="true"></i> Locked Site:');
      $("#locked-subsection").append("<p>" + convertBoolean(locked) + "</p>")
    }
    if (comm_garden_type != "") {
      $("#commtype-header").append('<i class="fa fa-thumbs-o-up" aria-hidden="true"></i> Community Garden Type:');
      $("#commtype-subsection").append("<p>" + comm_garden_type + "</p>")
    }
    if (types != "") {
      $("#types-header").append('<i class="fa fa-leaf" aria-hidden="true"></i> Garden Type:');
      $("#types-subsection").append("<p>" + types + "</p>")
    }
    if (water_system != "") {
      $("#water-header").append('<i class="fa fa-tint" aria-hidden="true"></i> Water System:');
      $("#water-subsection").append("<p>" + water_system + "</p>")
    }
    if (compost != null) {
      $("#compost-header").append('<i class="fa fa-recycle" aria-hidden="true"></i> Compost Available:');
      $("#compost-subsection").append("<p>" + convertBoolean(compost) + "</p>")
    }
    if (structures != "") {
      $("#structures-header").append('<i class="fa fa-building-o" aria-hidden="true"></i> Structures and Features:');
      $("#structures-subsection").append("<p>" + structures + "</p>")
    }
    if (season_extension != "") {
      $("#seasonex-header").append('<i class="fa fa-arrow-right" aria-hidden="true"></i> Season Extension Techniques:<br>');
      $("#seasonex-subsection").append("<p>" + season_extension+ "</p>")
    }
    if (animals != "") {
      $("#animal-header").append('<i class="fa fa-paw" aria-hidden="true"></i> Animals:');
      $("#animal-subsection").append("<p>" + animals + "</p>")
    }
    if (other_support != "") {
      $("#support-header").append('<i class="fa fa-signing" aria-hidden="true"></i> Support Organizations:');
      $("#support-subsection").append("<p>" + other_support + "</p>")
    }
    if (website != "") {
      $("#website-header").append('<i class="fa fa-bookmark" aria-hidden="true"></i> Website:');
      $("#website-subsection").append("<p><a href='" + website + "'>" + website + "</a></p>")
    }
    if (facebook != "") {
      $("#facebook-header").append('<i class="fa fa-facebook-square" aria-hidden="true"></i> <a href="' + facebook + '">Facebook Page</a>');
    }
    if (fence != null) {
      $("#fence-header").append('<i class="fa fa-bars" aria-hidden="true"></i> Fenced In:');
      $("#fence-subsection").append("<p>" + convertBoolean(fence) + "</p>")
    }
    if (description != "") {
      $("#description-header").append('<br><i class="fa fa-ellipsis-h" aria-hidden="true"></i> Description:');
      $("#description-subsection").append("<p>" + description + "</p>")
    }
    if (dormant != null) {
      $("#dormant-header").append('<i class="fa fa-pause" aria-hidden="true"></i> Dormant Site:');
      $("#dormant-subsection").append("<p>" + convertBoolean(dormant) + "</p>")
    }
    if (ward_num != null) {
      $("#ward-header").append('<i class="fa fa-university" aria-hidden="true"></i> Ward:');
      $("#ward-subsection").append("<p>" + ward_num + "</p>")
    }
    if (community_area != "") {
      $("#commarea-header").append('<i class="fa fa-map-marker" aria-hidden="true"></i> Community Area:');
      $("#commarea-subsection").append("<p>" + community_area + "</p>")
    }
    if (contact_info != "") {
      $("#contact-header").append('<i class="fa fa-phone aria-hidden="true"></i> Contact Info:');
      $("#contact-subsection").append("<p>" + contact_info + "</p>")
    }
    if ((contact_info != "") | (website != "") | (facebook != ""))  {
      $("#with_contact").append('<br><strong>Contact</strong><br>');
    }  
    if ((community_area != "") | (ward_num != "")) {
      $("#with_location").append('<br><strong>Location</strong><br>');
    }  
    if ((production_list != null) | (community_list != null) | (comm_garden_type != "") | (fence != null) | (locked != null) | (water_system != "") | (compost != null) | (season_extension != "") | (structures != "") | (animals != "")) {
      $("#with_features").append('<br><strong>Features</strong><br>');
    }  
    if ((owner_list != "") | (other_support != "") | (types != "") | (description != "") | (dormant != null))  {
      $("#with_about").append('<br><strong>About</strong>');
    }  
  
  };

});
