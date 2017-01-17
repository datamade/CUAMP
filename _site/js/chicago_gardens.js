$(function() {
  // Create example object.
  var exMap = new CartoLib
  // Update map settings.
  exMap.cartoTableName  = 'all_garden_answers';
  exMap.cartoUserName   = 'clearstreets';
  exMap.fields          = 'food_producing, community_garden, ownership, garden_address, growing_site_name';
  exMap.mapDivName      = 'mapCanvas';
  // Create a map!
  exMap.initiateMap()
  exMap.addInfoBox('bottomright', 'infoBox');
  var layer1 = exMap.defineSublayer("select * from all_garden_answers", '#carto-result-style');
  // Custom code.
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
        layerZero.on('featureClick', function(data){
          // You can add something here, too, e.g., a modal window.
        });
      }).error(function(e) {
        console.log(e)
      });

      $("#btnSearch").on("click", function() {
        exMap.doSearch();
      });
});

// Build this custom function yourself. It should format data from your Carto map into HTML.
function makeInfoText(data) {
  ownership        = ''
  food_producing   = ''
  community_garden = ''
  site_name        = "<h4>" + data.growing_site_name + "</h4>"
  address          = "<p><i class='fa fa-map-marker' aria-hidden='true'></i> " + data.garden_address + "</p>"

  if (data.ownership) {
      ownership = "<p><i class='fa fa-home' aria-hidden='true'></i> Ownership: " + data.ownership + "</p>"
  }

  if (data.food_producing == true) {
      food_producing = "<p><i class='fa fa-cutlery' aria-hidden='true'></i> Food producing</p>"
  }

  if (data.community_garden == true) {
      food_producing = "<p><i class='fa fa-users' aria-hidden='true'></i> Community garden</p>"
  }

  html = site_name + address + ownership + food_producing

  return html
};


