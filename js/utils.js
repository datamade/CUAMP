// Used in chicago_gardens.js
var capitalizeConversion = function capitalizeConversion(str) {
  var lower = str.toLowerCase();
  return lower.replace(/(^| )(\w)/g, function(x) {
    return x.toUpperCase();
  });
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
    return "<i class="+"'fa fa-check'"+" aria-hidden="+"'true'"+"></i>"
  }
  else if (text == false) {
    return "<i class="+"'fa fa-times'"+" aria-hidden="+"'true'"+"></i>"
  }
  else {
  }
};
