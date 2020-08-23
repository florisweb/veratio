
function Color(_str) {
  const InvalidStr_responseValue = [0, 0, 0, 0];
  this.value = setColorValue(_str); // [r, g, b, a]

  function setColorValue(_str) {
    if (!_str || typeof _str !== "string") return InvalidStr_responseValue;
    if (_str.substr(0, 1) == "#") return hexToValue(_str)
   
    let prefix = _str.split("rgba(");
  
    if (prefix.length < 2) prefix = _str.split("rgb(");
    let colors = prefix[1].substr(0, prefix[1].length - 1).split(",");

    return [
      parseFloat(colors[0]),
      parseFloat(colors[1]),
      parseFloat(colors[2]),
      colors[3] ? parseFloat(colors[3]) : 1
    ]
  }
 
    function hexToValue(hex) { // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
      });

      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
        1
      ] : InvalidStr_responseValue;
    }



  this.toHex = function() {
    return "#" + componentToHex(this.value[0]) + componentToHex(this.value[1]) + componentToHex(this.value[2]);

    function componentToHex(c) {
        var hex = Math.round(c).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
  }

  this.toRGB = function() {
    return "rgb(" + this.value[0] + ", " + this.value[1] + ", " + this.value[2] + ")";
  }

  this.toRGBA = function() {
    return "rgba(" + this.value[0] + ", " + this.value[1] + ", " + this.value[2] + ", " + this.value[3] + ")";
  }


  this.merge = function(_color, _percentage = .5) {
    if (!_color) return false;
    let newColor = new Color();

    for (let i = 0; i < this.value.length; i++)
    {
      newColor.value[i] = this.value[i] * _percentage + _color.value[i] * (1 - _percentage);
    }
    
    return newColor;
  }
}
