$(function() {
  // Create example object.
  var exMap = new CartoLib
  // Update map settings.
  exMap.cartoTableName  = 'all_garden_answers';
  exMap.cartoUserName   = 'clearstreets';
  exMap.fields          = 'food_producing, community_garden, ownership, garden_address, growing_site_name, the_geom';
  exMap.mapDivName      = 'mapCanvas';
  // Create a map!
  exMap.initiateMap()
  exMap.addInfoBox('bottomright', 'infoBox');

  var layer1 = exMap.defineSublayer("select * from all_garden_answers", '#carto-result-style');

  var layer2 = {
    sql: "SELECT * FROM boundaries_for_wards_2015", 
    cartocss: $('#carto-result-style2').html().trim()};

  exMap.createCartoLayer(layer1).addTo(exMap.map)
      .done(function(layer) {
        var mapName = "#" + exMap.mapDivName + " div"
        layerZero = layer.getSubLayer(0);
        layerZero.setInteraction(true);
        layerZero.on('featureOver', function(e, latlng, pos, data, subLayerIndex) {
          $(mapName).css('cursor','pointer');
          // Add custom text to the info window.
          var text = makeInfoText(data);
          
          CartoLib.prototype.updateInfoBox(text, "infoBox");
        });
        layerZero.on('featureOut', function() {
          $(mapName).css('cursor','inherit');
          CartoLib.prototype.clearInfoBox("infoBox");
        });
        layerZero.on('featureClick', function(e, latlng, pos, data, subLayerIndex){
          modalPop(data);
        });
      });
      
      $(".close-btn").on('click', function() {
        modalPop(null);
      });

      $("#btnSearch").on("click", function() {
        exMap.doSearch();
      });

      $("#btnReset").on("click", function() {
        exMap.clearSearch();
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
});

  function makeSelectData(array) {
    data_arr = []
    for(var i = 0; i < array.length; i++) {
      data_arr.push({ id: i, text: array[i]})
    }
    return data_arr
  };

  function convertBoolean(text) {
    if (text.toLower() == "Yes")
      return "true"
    else {
      return "false"
    }
  }

  function makeInfoText(data) {
    ownership        = ''
    food_producing   = ''
    community_garden = ''
    site_name        = "<h4>" + data.growing_site_name + "</h4>"
    address          = "<p><i class='fa fa-map-marker' aria-hidden='true'></i> " + data.garden_address + "</p>"

    html = site_name + address + ownership + food_producing

    return html
  };

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


CartoLib.prototype.doSearch = function() {
    this.clearSearch();

    var cartoLib = this;
    // #search-address refers to a div id in map-example.html. You can rename this div.
    var address = $("#search-address").val();
    var radius = $("#search-radius").val();
    var ward_number = $("#search-ward").val();
    var owner = $("#search-ownership").val();
    var community_garden = $("#search-community").val();
    var food_production = $("#search-production").val();
    var location = this.locationScope;

    if (radius == null && address != "") {
      radius = 8050;
    }

    if (address != "") {
      this._geocoder.geocode( { 'address' : address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
         cartoLib.currentPinpoint = [results[0].geometry.location.lat(), results[0].geometry.location.lng()];
          var geoSearch = "ST_DWithin(ST_SetSRID(ST_POINT(" + cartoLib.currentPinpoint[1] + ", " + cartoLib.currentPinpoint[0] + "), 4326)::geography, the_geom::geography, " + radius + ")";
          var whereClause = " WHERE the_geom is not null AND " + geoSearch;

          // var path = $.address.value();
          // var parameters = {
          //   "address": CartoLib.address,
          //   "radius": CartoLib.radius,
          //   "ward": CartoLib.wardSelections,
          //   "owner": CartoLib.ownerSelections,
          //   "community": CartoLib.communitySelections,
          //   "production": CCartoLib.productionSelections,
          //   "path": path
          // }

          // CartoLib.prototype.runSQL();
          // $.address.parameter('ward', CartoLib.wardSelections);
          // $.address.parameter('owner', CartoLib.ownerSelections);
          // $.address.parameter('community', CartoLib.communitySelections);
          // $.address.parameter('production', CartoLib.productionSelections);

          cartoLib.setZoom(radius);
          cartoLib.addIcon();
          cartoLib.addCircle(radius);
        }
        else {
          alert("We could not find your address: " + status);
        }
      });
    }

    if (ward_number != null) {
      var sql_query = "SELECT ward_addr FROM table_2015_ward_offices WHERE ward=" + ward_number;
      var sql = new cartodb.SQL({ user:'clearstreets' });
      var searcher = this._geocoder
      sql.execute(sql_query).done(function (data){

        content = data.rows[0].ward_addr
        searcher.geocode( { 'address' : content }, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            cartoLib.currentPinpoint = [results[0].geometry.location.lat(), results[0].geometry.location.lng()]
            var geoFind = "ST_SetSRID(ST_POINT(" + cartoLib.currentPinpoint[1] + ", " + cartoLib.currentPinpoint[0] + "), 8050)";

            radius = 8050;

            cartoLib.addIcon();
            cartoLib.setZoom(radius);

          }

          else {
            alert("We could not find your ward")
          };
        })
      })
    }

    else {
      // this.map.setView(this.mapCentroid, this.defaultZoom)
      // var parameters = {
      //   "address": CartoLib.address,
      //   "radius": CartoLib.radius,
      //   "ward": CartoLib.wardSelections,
      //   "owner": CartoLib.ownerSelections,
      //   "community": CartoLib.communitySelections,
      //   "production": CartoLib.productionSelections
      // }

      CartoLib.prototype.runSQL();

      // $.address.parameter('ward', CartoLib.wardSelections);
      // $.address.parameter('owner', CartoLib.ownerSelections);
      // $.address.parameter('community', CartoLib.communitySelections);
      // $.address.parameter('production', CartoLib.productionSelections);

      // cartoLib.setZoom(radius);
      // cartoLib.addIcon();
      // cartoLib.addCircle(radius);
    }
  
  };
