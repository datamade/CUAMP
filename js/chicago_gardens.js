var chicagoGardens = chicagoGardens || {};
var chicagoGardens = {
  cartoTableName: 'cuamp_allgardens_master',
  cartoUserName: 'cuamp',
  locationScope: 'chicago',
  mapDivName: 'mapCanvas',
  map: null,
  mapCentroid: new L.LatLng(41.901557, -87.630360),
  defaultZoom: 11,
  lastClickedLayer: null,
  geojson: '',
  currentPinpoint: '',
  userSelection: '',
  wardSelections: '',
  ownerSelections: '',
  communitySelections: '',
  productionSelections: '',
  centerMark: '',
  radiusCircle: '',
  wardBorder: '',
  filterAddress: '',
  sublayerOne: '',
  sublayerWards: '',
  sublayerCommunities: '',
  sublayerDistricts: '',
  whereClause: '',
  joinClause: '',
  ward_number: '',
  district_number: '',
  garden_type: '',
  neighborhood: '',
  wardSQL: '',
  districtSQL: '',
  communityareaSQL: '',
  gardenSQL: '',
  resultsNumber: '',
  cartoFields: 'the_geom, the_geom_webmercator, growing_site_name, is_growing_site_locked, evidence_of_support_organizations, if_it_s_a_community_garden_is_it_collective_or_allotment, choose_growing_site_types, water, compost_system, structures_and_features, season_extension_techniques, animals, address, food_producing, community_garden, is_growing_site_dormant, latitude, longitude, ownership, other_support_organization, growing_site_website, facebook, is_growing_site_fenced, description, ward, communities, public_contact_info, growing_site_image, municipalities',
  // Create geocoder object to access Google Maps API. Add underscore to insure variable safety.
   _geocoder: new google.maps.Geocoder(),
    // Turn on autocomplete to predict address when user begins to type.
   _autocomplete: new google.maps.places.Autocomplete(document.getElementById('search-address')),

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
    this.renderList();
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
    if (this.filterAddress)
      this.filterAddress = '';
    if (this.neighborhood)
      this.neighborhood = '';
    if (this.ward_number)
      this.ward_number = '';
    if (this.district_number)
      this.district_number = '';
  },

  doSearch: function() {
    this.clearSearch();
    chicagoGardens.whereClause = " WHERE gardens.the_geom is not null";
    this.calcCollapsibleLocations();
    var gardenMap = this;
    var radius;
    var owner = $("#search-ownership").select2('data');
    var garden_type = $("#search-type").select2('data');
    var garden_structure = $("#search-structure").select2('data');
    var ownerSQL = this.ownerSelectionSQL(owner)
    var typeSQL = this.typeSelectionSQL(garden_type)
    var structureSQL = this.structureSelectionSQL(garden_structure)

    if (owner != '') {
      chicagoGardens.whereClause += ' AND (' + ownerSQL + ')'
    }

    if (garden_type != '') {
      chicagoGardens.whereClause += ' AND (' + typeSQL + ')'
    }

    if (garden_structure != '') {
      chicagoGardens.whereClause += ' AND (' + structureSQL + ')'
    }

    if ($('#search-production').is(':checked')) {
      chicagoGardens.whereClause += ' AND gardens.food_producing = true'
    }

    var location = gardenMap.locationScope;

    if (radius == null && chicagoGardens.filterAddress != "") {
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
          chicagoGardens.renderList();
        }
        else {
          alert("We could not find your address: " + status);
        }
      });
    }

    else if (chicagoGardens.neighborhood != '') {
      chicagoGardens.joinClause = " join boundaries_community_areas_2017 as community_areas on ST_Intersects(gardens.the_geom, community_areas.the_geom)"
      chicagoGardens.whereClause += " AND " + chicagoGardens.communityareaSQL
    }

    else if (chicagoGardens.ward_number != '') {
      chicagoGardens.joinClause = " join boundaries_for_wards_2015 as wards on ST_Intersects(gardens.the_geom, wards.the_geom)"
      chicagoGardens.whereClause += " AND " + chicagoGardens.wardSQL
    }

    else if (chicagoGardens.district_number != '') {
      chicagoGardens.joinClause = " join ccgisdata_commissioner_districts_2017 as districts on ST_Intersects(gardens.the_geom, districts.the_geom)"
      chicagoGardens.whereClause += " AND " + chicagoGardens.districtSQL
    }

    if (chicagoGardens.filterAddress == "") {
      chicagoGardens.renderMap();
      chicagoGardens.renderList();
    }
  },

  renderMap: function() {
    chicagoGardens.gardenSQL = "SELECT gardens.* from cuamp_allgardens_master as gardens" + chicagoGardens.joinClause + " " + chicagoGardens.whereClause;

    communityLayerSQL = "SELECT community_areas.* from boundaries_community_areas_2017 as community_areas WHERE community_areas.community = 'WICKER PARK'"
      if (chicagoGardens.neighborhood != '' && chicagoGardens.filterAddress == "") {
        communityLayerSQL += "OR " + chicagoGardens.communityareaSQL;
      }
    wardLayerSQL = "SELECT wards.* from boundaries_for_wards_2015 as wards WHERE wards.ward = '51'"
      if (chicagoGardens.ward_number != "" && chicagoGardens.neighborhood == "" && chicagoGardens.filterAddress == "") {
          wardLayerSQL += "OR " + chicagoGardens.wardSQL;
      }
    districtLayerSQL = "SELECT districts.* from ccgisdata_commissioner_districts_2017 as districts WHERE districts.district_n = '18'"
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
    if (chicagoGardens.ward_number == "" && chicagoGardens.neighborhood == "" && chicagoGardens.district_number == "" && chicagoGardens.filterAddress == "") {
      this.map.setView(chicagoGardens.mapCentroid, 11);
    }

  },

  renderList: function() {
    var sql = new cartodb.SQL({ user: chicagoGardens.cartoUserName });
    var results = $('#results-list');
    var elements = {
      growing_site_name: '',
      community: '',
      address: '',
      ward: ''
    };

    results.empty();

    sql.execute(chicagoGardens.gardenSQL)
      .done(function(listData) {
        var obj_array = listData.rows;

        if (listData.rows.length == 0) {
          results.append("<p class='no-results'>No results. Please broaden your search.</p>");
        }
        else {
          for (idx in obj_array) {
            var growingSiteName = obj_array[idx].growing_site_name;
            var address = obj_array[idx].address;
            var community = obj_array[idx].communities;
            var ward = obj_array[idx].ward;

            if (growingSiteName != "") {
              elements["growing_site_name"] = growingSiteName;
            }
            if (community != "") {
              elements["community"] = capitalizeConversion(community);
            }
            if (address != "") {
              elements["address"] = address;
            }
            if (ward != "") {
              elements["ward"] = ward;
            }

            var output = Mustache.render("<tr>" +
            // Name column
            "<td><span class='facility-name'>{{growing_site_name}}</span><br>" +
            "<span class='hidden-sm hidden-md hidden-lg'><i class='fa fa-map-marker'></i>&nbsp&nbsp{{address}}</td>" +

            // Location column
            "<td class='hidden-xs'><i class='fa fa-map-marker' aria-hidden='true'></i>&nbsp&nbsp<span class='facility-address'>{{address}}</span><br>" +
            "<i class='fa fa-home' aria-hidden='true'></i> {{community}} Neighborhood<br>" +
            "<i class='fa fa-university' aria-hidden='true'></i> Ward {{ward}}</td>" +

            // Directions column
            "<td class='hidden-xs'><span class='modal-directions' style='white-space: nowrap;'><a href='http://maps.google.com/?q={{address}}' target='_blank'>Get directions</a></span></td>" +
            "</tr>", elements);

            results.append(output);
          }
        }
    }).done(function(listData) {
        $(".facility-name").on("click", function() {
          var thisName = $(this).text();
          var objArray = listData.rows;
          $.each(objArray, function( index, obj ) {
            if (obj.growing_site_name == thisName ) {
              modalPop(obj)
            }
          });
        });
    }).error(function(errors) {
      console.log("errors:" + errors);
    });
  },

  ownerSelectionSQL: function(array) {
    var results = '';
    $.each( array, function(index, obj) {
      results += ("gardens.ownership = '" + obj.text + "' OR ")
    })

    results_final = results.substring(0, results.length -4);
    return results_final
  },

  structureSelectionSQL: function(array) {
    var results = '';
    $.each( array, function(index, obj) {
      results += ("gardens.structures_and_features LIKE '%" + obj.text + "%' OR ")
    })

    results_final = results.substring(0, results.length -4);
    return results_final
  },

  typeSelectionSQL: function(array) {
    var results = '';
    $.each( array, function(index, obj) {
      results += ("gardens.choose_growing_site_types LIKE '%" + obj.text + "%' OR ")
    })

    results_final = results.substring(0, results.length -4);
    return results_final
  },

  multipleSelectionSQL: function(array) {
    var results = '';
    $.each( array, function(index, obj) {
      results += ("'" + obj.text + "', ")
    })

    results_final = results.substring(0, results.length -2);
    return results_final
  },

  calcCollapsibleLocations: function() {
    if ($('div#collapseOne').hasClass('in')) {
      chicagoGardens.filterAddress = $("#search-address").val();
      radius = $("#search-radius").val();
      // Reset other filters
      $("#search-neighborhood").val('').trigger('change');
      $("#search-ward").val('').trigger('change');
      $("#search-district").val('').trigger('change');
    }

    if ($('div#collapseTwo').hasClass('in')) {
      chicagoGardens.neighborhood = $("#search-neighborhood").select2('data');
      chicagoGardens.communityareaSQL = "community_areas.community IN (" + this.multipleSelectionSQL(chicagoGardens.neighborhood) + ")"
      // Reset other filters
      $("#search-address").val('').trigger('change');
      $("#search-ward").val('').trigger('change');
      $("#search-district").val('').trigger('change');
    }

    if ($('div#collapseThree').hasClass('in')) {
      chicagoGardens.ward_number = $("#search-ward").select2('data');
      chicagoGardens.wardSQL = "wards.ward IN (" + this.multipleSelectionSQL(chicagoGardens.ward_number) + ")"
      // Reset other filters
      $("#search-address").val('').trigger('change');
      $("#search-neighborhood").val('').trigger('change');
      $("#search-district").val('').trigger('change');
    }

    if ($('div#collapseFour').hasClass('in')) {
      chicagoGardens.district_number = $("#search-district").select2('data');
      chicagoGardens.districtSQL = "districts.district_n IN (" + this.multipleSelectionSQL(chicagoGardens.district_number) + ")"
      // Reset other filters
      $("#search-address").val('').trigger('change');
      $("#search-neighborhood").val('').trigger('change');
      $("#search-ward").val('').trigger('change');
    }
  },

} // close chicagoGardens object
