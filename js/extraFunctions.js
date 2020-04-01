

function newId() {return parseInt(Math.round(Math.random() * 100000000) + "" + Math.round(Math.random() * 100000000));}

function setTextToElement(element, text) {
  element.innerHTML = "";
  let a = document.createElement('a');
  a.text = text;
  element.append(a);
}

function isDescendant(parent, child) {
  if (typeof parent.length !== "number") return _isDescendant(parent, child);
  for (let i = 0; i < parent.length; i++)
  {
    if (_isDescendant(parent[i], child)) return true;
  }

  function _isDescendant(parent, child) {
    if (parent == child) return true;
    
     var node = child.parentNode;
     while (node != null) {
         if (node == parent) {
             return true;
         }
         node = node.parentNode;
     }
     return false;
  }
}


function inArray(arr, item) {
  for (let i = 0; i < arr.length; i++)
  {
    if (arr[i] == item)
    {
      return true;
    }
  }
  return false;
}


Array.prototype.randomItem = function() {
  return this[Math.round((this.length - 1) * Math.random())];
}
Array.prototype.lastItem = function() {
  return this[this.length - 1];
}



function isPromise(_promise) {
  if (_promise.then) return true;
  return false;
}

function mergeColours(_colourA, _colourB, _colourAPerc = 0.5) {
  colorBPerc = 1 - _colourAPerc;
  if (Object.keys(_colourA).length < 3 && Object.keys(_colourB).length < 3) return {r: 255, g: 255, b: 255};
  if (Object.keys(_colourA).length < 3) return _colourB;
  if (Object.keys(_colourB).length < 3) return _colourA;
  
  let obj = {
    r: _colourA.r * _colourAPerc + _colourB.r * colorBPerc,
    g: _colourA.g * _colourAPerc + _colourB.g * colorBPerc,
    b: _colourA.b * _colourAPerc + _colourB.b * colorBPerc
  }
  if (_colourA.a && _colourB.a) obj.a = _colourA.a * _colourAPerc + _colourB.a * colorBPerc;
  return obj;
}

function colourToString(_colour) {
  if (!_colour || typeof _colour.r !== "number" || typeof _colour.g !== "number" || typeof _colour.b !== "number") return false;
  let color = "rgb(" + parseInt(_colour.r) + ", " + parseInt(_colour.g) + ", " + parseInt(_colour.b) + ")";
  if (_colour.a) color = "rgba(" + parseInt(_colour.r) + ", " + parseInt(_colour.g) + ", " + parseInt(_colour.b) + ", " + _colour.a + ")";
  return color;
}

function stringToColour(_str) {
  if (!_str || typeof _str !== "string") return false;
  if (_str.substr(0, 1) == "#") return hexToRgb(_str)
 
  let prefix = _str.split("rgba(");
  if (prefix.length < 2) prefix = _str.split("rgb(");
  let colors = prefix[1].substr(0, prefix[1].length - 1).split(",");

  return {
    r: parseFloat(colors[0]),
    g: parseFloat(colors[1]),
    b: parseFloat(colors[2]),
    a: colors[3] ? parseFloat(colors[3]) : 1
  }
}


	function rgbToHex(_colour) {
	    return "#" + componentToHex(_colour.r) + componentToHex(_colour.g) + componentToHex(_colour.b);

		function componentToHex(c) {
		    var hex = c.toString(16);
		    return hex.length == 1 ? "0" + hex : hex;
		}
	}

	function hexToRgb(_hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(_hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1
    } : null;
	}

  function stringToRGB(_string) {
    return colourToString(stringToColour(_string));
  }


// https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;

  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }

  var longerLength = longer.length;
  if (longerLength == 0) {return 1.0;}

  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);


  function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
        {
        costs[j] = j;
        } else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
            costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
      costs[s2.length] = lastValue;
    }

    return costs[s2.length];
  }
}



function removeSpacesFromEnds(_str) {
  for (let c = 0; c < _str.length; c++)
  {
    if (_str[0] !== " ") continue;
    _str = _str.substr(1, _str.length);
  }

  for (let c = _str.length; c > 0; c--)
  {
    if (_str[_str.length - 1] !== " ") continue;
    _str = _str.substr(0, _str.length - 1);
  }
  return _str;
} 


// https://stackoverflow.com/questions/6562727/is-there-a-function-to-deselect-all-text-using-javascript
function clearSelection() {
  if (window.getSelection) {window.getSelection().removeAllRanges();}
  else if (document.selection) {document.selection.empty();}
}
















function optionGroup_select(_item) {
  let group = _item.parentNode;
  for (let i = 0; i < group.children.length; i++)
  {
    group.children[i].classList.remove("selected");
    if (group.children[i] == _item) 
    {
      group.value = i;
    }
  }
  _item.classList.add("selected");
}
