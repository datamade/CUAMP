// Used in chicago_gardens.js
var capitalizeConversion = function capitalizeConversion(str) {
  var lower = str.toLowerCase();
  return lower.replace(/(^| )(\w)/g, function(x) {
    return x.toUpperCase();
  });
};

var downloadCSV = function downloadCSV(csv_data) {
  // Reference: https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
  downloadLink = document.createElement("a");
  blob = new Blob(["\ufeff", csv_data]);
  url = URL.createObjectURL(blob);
  downloadLink.href = url;
  downloadLink.download = "cuamp_gardens.csv";

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

// Used in chicago_gardens_map.js
var makeSelectData = function makeSelectData(array) {
  data_arr = []
  for(var i = 0; i < array.length; i++) {
    data_arr.push({ id: i, text: array[i]})
  }
  return data_arr
};

var convertBoolean =  function convertBoolean(text) {
  if (text == true) {
    return "<i class="+"'fa fa-check'"+" aria-hidden="+"'true'"+"></i> Yes"
  }
  else if (text == false) {
    return "<i class="+"'fa fa-times'"+" aria-hidden="+"'true'"+"></i> No"
  }
  else {
  }
};

var modalPop = function modalPop(data) {
    locationSQL = 'SELECT wards.ward, community_areas.community, districts.district_n ' + 'FROM cuamp_master_allgardens as gardens, boundaries_for_wards_2015 as wards, boundaries_community_areas_2017 as community_areas, ccgisdata_commissioner_districts_2017 as districts ' + 'WHERE ST_Intersects(gardens.the_geom, wards.the_geom) AND ST_Intersects(gardens.the_geom, community_areas.the_geom)  AND ST_Intersects(gardens.the_geom, districts.the_geom) AND gardens.cuamp_id=' + data.cuamp_id
    var sql = new cartodb.SQL({  user: chicagoGardens.cartoUserName  });
    console.log(locationSQL, "$$$")

    sql.execute(locationSQL).done(function (locationData) {
      var contact = '<p id="modal-address"><a href="http://maps.google.com/?q=' + data.address + '" target="_blank"><i class="fa fa-map-marker" aria-hidden="true"></i> ' + data.address + '</a></span></p>'
      $('#modal-pop').appendTo('body').modal();
      $('#modal-title, #address-header, #owner-header, #community-header, #production-header, #address-subsection, #owner-subsection, #community-subsection, #production-subsection, #locked-header, #locked-subsection, #commtype-header, #commtype-subsection, #types-header, #types-subsection, #water-header, #water-subsection, #compost-header, #compost-subsection, #structures-header, #structures-subsection, #seasonex-header, #seasonex-subsection, #animal-header, #animal-subsection, #dormant-header, #dormant-subsection, #support-header, #support-subsection, #website-header, #website-subsection, #facebook-header, #facebook-subsection, #fence-header, #fence-subsection, #description-header, #description-subsection, #ward-header, #ward-subsection, #commarea-header, #commarea-subsection, #district-header, #district-subsection, #municipality-header, #municipality-subsection, #contact-header, #contact-subsection, #withContact, #withLocation, #withInformation, #withFeatures').empty();
      $('#modal-title').html(data.growing_site_name + "<p>CUAMP ID: " + data.cuamp_id + "</p>");
      $('#modal-main').html(contact);
      // Header
      var address_list = data.address
      var description = data.description
      // Location
      var ward_num = locationData['rows'][0].ward
      var community_area = locationData['rows'][0].community
      var district_number = locationData['rows'][0].district_n
      var municipality = data.municipalities
      // Contact and people
      var owner_list = data.ownership
      var contact_info = data.public_contact_info
      var website = data.growing_site_website
      var facebook = data.facebook
      var other_support = data.other_support_organization
      // Features
      var water_system = data.water
      var compost = data.compost_system
      var structures = data.structures_and_features
      var animals = data.animals
      var fence = data.is_growing_site_fenced
      var production_list = data.food_producing
      // Information
      var community_list = data.community_garden
      var comm_garden_type = data.if_it_s_a_community_garden_is_it_collective_or_allotment
      var types = data.choose_growing_site_types
      var locked = data.is_growing_site_locked
      var season_extension = data.season_extension_techniques
      var dormant = data.is_growing_site_dormant
      
      // Find all instances of "yes."
      if (types != "") {
        $("#types-header").append('<i class="fa fa-leaf" aria-hidden="true"></i> Garden Type:');
        $("#types-subsection").append("<p><em>" + types + "</em></p>");
      }
      if (description != "") {
        $("#description-subsection").append("<p>" + description + "</p>");
      }

      // Location
      if (checkTruthiness(address_list) || checkTruthiness(ward_num) || checkTruthiness(community_area) || checkTruthiness(district_number)) {
          // Add header
          $("#withLocation").append('<br><strong>Location</strong><br>');
          // Add data
          if (checkTruthiness(address_list)) {
            $("#address-header").append('<i class="fa fa-user" aria-hidden="true"></i> Address:');
            $("#address-subsection").append("<p>" + address_list + "</p>");
          }
          if (checkTruthiness(ward_num)) {
            $("#ward-header").append('<i class="fa fa-university" aria-hidden="true"></i> Ward:');
            $("#ward-subsection").append("<p>" + ward_num + "</p>")
          }
          if (checkTruthiness(community_area)) {
            $("#commarea-header").append('<i class="fa fa-map-marker" aria-hidden="true"></i> Community Area:');
            $("#commarea-subsection").append("<p>" + community_area + "</p>")
          }
          if (checkTruthiness(district_number)) {
            $("#district-header").append('<i class="fa fa-map" aria-hidden="true"></i> Cook County District:');
            $("#district-subsection").append("<p>" + district_number + "</p>")
          }
          if (checkTruthiness(municipality)) {
            $("#municipality-header").append('<i class="fa fa-building" aria-hidden="true"></i> Municipality:');
            $("#municipality-subsection").append("<p>" + municipality + "</p>")
          }
      }

      // Contact and people
      if (checkTruthiness(contact_info) || checkTruthiness(website) || checkTruthiness(facebook) || checkTruthiness(owner_list) || checkTruthiness(other_support)) {
          // Add header
          $("#withContact").append('<br><strong>Contact and people</strong><br>');
          // Add data
          if (checkTruthiness(contact_info)) {
            $("#contact-header").append('<i class="fa fa-phone aria-hidden="true"></i> Contact Info:');
            $("#contact-subsection").append("<p>" + contact_info + "</p>")
          }
          if (checkTruthiness(website)) { 
            $("#website-header").append('<p><i class="fa fa-bookmark" aria-hidden="true"></i> <a href=' + website + "target=_blank'>Website</a></p>")
          }
          if (checkTruthiness(facebook)) {
            $("#facebook-header").append('<p><i class="fa fa-facebook-square" aria-hidden="true"></i> <a href="' + facebook + 'target=_blank">Facebook Page</a></p>');
          }
          if (checkTruthiness(owner_list)) {
              $("#owner-header").append('<i class="fa fa-usd" aria-hidden="true"></i> Ownership:');
              $("#owner-subsection").append("<p>" + owner_list + "</p>");
          }
          if (checkTruthiness(other_support)) {
            $("#support-header").append('<i class="fa fa-signing" aria-hidden="true"></i> Support Organizations:');
            $("#support-subsection").append("<p>" + other_support + "</p>")
          }
      }

      // Garden features
      if (checkTruthiness(water_system) || checkTruthiness(production_list) || checkTruthiness(compost) || checkTruthiness(structures) || checkTruthiness(animals) || checkTruthiness(fence)) {
          // Add header
          $("#withFeatures").append('<br><strong>Garden features</strong><br>');
          // Add data
          if (checkTruthiness(water_system)) {
            $("#water-header").append('<i class="fa fa-tint" aria-hidden="true"></i> Water System:');
            $("#water-subsection").append("<p>" + water_system + "</p>");
          }
          if (checkTruthiness(production_list)) {
            $("#production-header").append('<i class="fa fa-cutlery" aria-hidden="true"></i> Food Producing:');
            $("#production-subsection").append("<p>" + convertBoolean(production_list) + "</p>");
          }
          if (checkTruthiness(compost)) {
            $("#compost-header").append('<i class="fa fa-recycle" aria-hidden="true"></i> Compost Available:');
            $("#compost-subsection").append("<p>" + convertBoolean(compost) + "</p>")
          }
          if (checkTruthiness(structures)) {
            $("#structures-header").append('<i class="fa fa-building-o" aria-hidden="true"></i> Structures and Features:');
            $("#structures-subsection").append("<p>" + structures + "</p>")
          }
          if (checkTruthiness(animals)) {
            $("#animal-header").append('<i class="fa fa-paw" aria-hidden="true"></i> Animals:');
            $("#animal-subsection").append("<p>" + animals + "</p>")
          }
          if (checkTruthiness(fence)) {
            $("#fence-header").append('<i class="fa fa-bars" aria-hidden="true"></i> Fenced In:');
            $("#fence-subsection").append("<p>" + convertBoolean(fence) + "</p>")
          }
      }

      // Other information
      if (checkTruthiness(community_list) || checkTruthiness(comm_garden_type) || checkTruthiness(locked) || checkTruthiness(season_extension) || checkTruthiness(dormant)) {
          // Add header
          $("#withInformation").append('<br><strong>Other information</strong>');
          // Add data
          if (checkTruthiness(community_list)) {
            $("#community-header").append('<i class="fa fa-users" aria-hidden="true"></i> Community Garden:');
            $("#community-subsection").append("<p>" + convertBoolean(community_list) + "</p>");
          }
          if (checkTruthiness(comm_garden_type)) {
            $("#commtype-header").append('<i class="fa fa-thumbs-o-up" aria-hidden="true"></i> Community Garden Type:');
            $("#commtype-subsection").append("<p>" + comm_garden_type + "</p>")
          }
          if (checkTruthiness(locked)) {
            $("#locked-header").append('<i class="fa fa-lock" aria-hidden="true"></i> Locked Site:');
            $("#locked-subsection").append("<p>" + convertBoolean(locked) + "</p>")
          }
          if (checkTruthiness(season_extension)) {
            $("#seasonex-header").append('<i class="fa fa-arrow-right" aria-hidden="true"></i> Season Extension Techniques:<br>');
            $("#seasonex-subsection").append("<p>" + season_extension + "</p>")
          }
          if (checkTruthiness(dormant)) {
            $("#dormant-header").append('<i class="fa fa-pause" aria-hidden="true"></i> Dormant Site:');
            $("#dormant-subsection").append("<p>" + convertBoolean(dormant) + "</p>")
          }
      }

    }).error(function(errors) {
      console.log("errors:" + errors);
    });



};

var hiddenLink = function hiddenLink() {
    url = window.location.href;
    // Check if the user is trying to access the admin download. If yes, then trigger a download of all data.
    if (url.indexOf('?admin=download') > -1) {
      // Download data for composting
      header_names = ["growing_site_name", "address", "ward", "community"]
      chicagoGardens.buildCSV(header_names);
    }
};

var checkTruthiness = function checkTruthiness(text) {
    if ((text != null) && (text != "")) {
      return true;
    }
    else {
      return false;
    }
};