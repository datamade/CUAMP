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
    var contact = '<p id="modal-address"><a href="http://maps.google.com/?q=' + data.address + '" target="_blank"><i class="fa fa-map-marker" aria-hidden="true"></i> ' + data.address + '</a></span></p>'
    $('#modal-pop').appendTo('body').modal();
    $('#modal-title, #address-header, #owner-header, #community-header, #production-header, #address-subsection, #owner-subsection, #community-subsection, #production-subsection, #locked-header, #locked-subsection, #commtype-header, #commtype-subsection, #types-header, #types-subsection, #water-header, #water-subsection, #compost-header, #compost-subsection, #structures-header, #structures-subsection, #seasonex-header, #seasonex-subsection, #animal-header, #animal-subsection, #dormant-header, #dormant-subsection, #support-header, #support-subsection, #website-header, #website-subsection, #facebook-header, #facebook-subsection, #fence-header, #fence-subsection, #description-header, #description-subsection, #ward-header, #ward-subsection, #commarea-header, #commarea-subsection, #district-header, #district-subsection, #contact-header, #contact-subsection, #withContact, #withLocation, #withInformation, #withFeatures').empty();
    $('#modal-title').html(data.growing_site_name + "<p>CUAMP ID: " + data.cuamp_id + "</p>");
    $('#modal-main').html(contact);
    // Header
    var address_list = data.address
    var description = data.description
    // Location
    var ward_num = data.ward
    var community_area = data.community
    var district_number = data.district_n
    // Contact and people
    var owner_list = data.ownership
    var contact_info = data.public_contact_info
    var website = data.growing_site_website
    var facebook = data.facebook
    var other_support = data.other_support_organization
    var community_list = data.community_garden
    // Features
    var water_system = data.water
    var compost = data.compost_system
    var structures = data.structures_and_features
    var animals = data.animals
    var fence = data.is_growing_site_fenced
    var production_list = data.food_producing
    // Information
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
    if ((address_list != null) || (community_area != "") || (ward_num != "")) {
        // Add header
        $("#withLocation").append('<br><strong>Location</strong><br>');
        // Add data
        if (address_list != null) {
          $("#address-header").append('<i class="fa fa-user" aria-hidden="true"></i> Address:');
          $("#address-subsection").append("<p>" + address_list + "</p>");
        }
        if (ward_num != null) {
          $("#ward-header").append('<i class="fa fa-university" aria-hidden="true"></i> Ward:');
          $("#ward-subsection").append("<p>" + ward_num + "</p>")
        }
        if (community_area != "") {
          $("#commarea-header").append('<i class="fa fa-map-marker" aria-hidden="true"></i> Community Area:');
          $("#commarea-subsection").append("<p>" + community_area + "</p>")
        }
        if (district_number != "") {
          $("#district-header").append('<i class="fa fa-building" aria-hidden="true"></i> Cook County District:');
          $("#district-subsection").append("<p>" + district_number + "</p>")
        }
    }

    // Contact and people
    if ((contact_info != '') || (website != '') || (facebook != '') || (owner_list != '') || (community_list != '') || (other_support != '')) {
        // Add header
        $("#withContact").append('<br><strong>Contact and people</strong><br>');
        // Add data
        if (contact_info != "") {
          $("#contact-header").append('<i class="fa fa-phone aria-hidden="true"></i> Contact Info:');
          $("#contact-subsection").append("<p>" + contact_info + "</p>")
        }
        if (owner_list != "") {
            $("#owner-header").append('<i class="fa fa-usd" aria-hidden="true"></i> Ownership:');
            $("#owner-subsection").append("<p>" + owner_list + "</p>");
        }
        if (website != "") { 
          $("#website-header").append('<p><i class="fa fa-bookmark" aria-hidden="true"></i> <a href=' + website + "target=_blank'>Website</a></p>")
        }
        if (facebook != "") {
          $("#facebook-header").append('<p><i class="fa fa-facebook-square" aria-hidden="true"></i> <a href="' + facebook + 'target=_blank">Facebook Page</a></p>');
        }
        if (community_list != "") {
          $("#community-header").append('<i class="fa fa-users" aria-hidden="true"></i> Community Garden:');
          $("#community-subsection").append("<p>" + convertBoolean(community_list) + "</p>");
        }
        if (other_support != "") {
          $("#support-header").append('<i class="fa fa-signing" aria-hidden="true"></i> Support Organizations:');
          $("#support-subsection").append("<p>" + other_support + "</p>")
        }
    }

    // Garden features
    if ((water_system != "") || (production_list != null) || (compost != null) || (structures != "") || (animals != "") || (animals != "") || (fence != null)) {
        // Add header
        $("#withFeatures").append('<br><strong>Garden features</strong><br>');
        // Add data
        if (water_system != "") {
          $("#water-header").append('<i class="fa fa-tint" aria-hidden="true"></i> Water System:');
          $("#water-subsection").append("<p>" + water_system + "</p>");
        }
        if (production_list != null) {
          $("#production-header").append('<i class="fa fa-cutlery" aria-hidden="true"></i> Food Producing:');
          $("#production-subsection").append("<p>" + convertBoolean(production_list) + "</p>");
        }
        if (compost != null) {
          $("#compost-header").append('<i class="fa fa-recycle" aria-hidden="true"></i> Compost Available:');
          $("#compost-subsection").append("<p>" + convertBoolean(compost) + "</p>")
        }
        if (structures != "") {
          $("#structures-header").append('<i class="fa fa-building-o" aria-hidden="true"></i> Structures and Features:');
          $("#structures-subsection").append("<p>" + structures + "</p>")
        }
        if (animals != "") {
          $("#animal-header").append('<i class="fa fa-paw" aria-hidden="true"></i> Animals:');
          $("#animal-subsection").append("<p>" + animals + "</p>")
        }
        if (fence != null) {
          $("#fence-header").append('<i class="fa fa-bars" aria-hidden="true"></i> Fenced In:');
          $("#fence-subsection").append("<p>" + convertBoolean(fence) + "</p>")
        }
    }

    // Information to know
    if ((locked != "") | (dormant != "") | (season_extension != "") | (dormant != null))  {
        // Add header
        $("#withInformation").append('<br><strong>Other information</strong>');
        // Add data
        if (comm_garden_type != "") {
          $("#commtype-header").append('<i class="fa fa-thumbs-o-up" aria-hidden="true"></i> Community Garden Type:');
          $("#commtype-subsection").append("<p>" + comm_garden_type + "</p>")
        }
        if (locked != null) {
          $("#locked-header").append('<i class="fa fa-lock" aria-hidden="true"></i> Locked Site:');
          $("#locked-subsection").append("<p>" + convertBoolean(locked) + "</p>")
        }
        if (dormant != null) {
          $("#dormant-header").append('<i class="fa fa-pause" aria-hidden="true"></i> Dormant Site:');
          $("#dormant-subsection").append("<p>" + convertBoolean(dormant) + "</p>")
        }
        if (season_extension != "") {
          $("#seasonex-header").append('<i class="fa fa-arrow-right" aria-hidden="true"></i> Season Extension Techniques:<br>');
          $("#seasonex-subsection").append("<p>" + season_extension + "</p>")
        }
    }
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