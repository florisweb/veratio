
function $(_string) {
  return document.querySelectorAll(_string);
}




function newId() {return Math.round(Math.random() * 100000000) + "" + Math.round(Math.random() * 100000000);}

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
     while (node != null) 
     {
         if (node == parent) return true;
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



function setImageSource(_image, _html) {
  let element = document.createElement("img");
  if (typeof _image == "string")
  {
    element.classList.add('optionIcon');
    element.setAttribute("src", _image);
  } else {
    element = _image;
  }
  _html.insertBefore(element, _html.firstChild);
}


function getRandomItem(_arr) {
  return _arr[Math.round((_arr.length - 1) * Math.random())];
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










// EXTERNAL CODE

// https://stackoverflow.com/questions/6562727/is-there-a-function-to-deselect-all-text-using-javascript
function clearSelection() {
  if (window.getSelection) {window.getSelection().removeAllRanges();}
  else if (document.selection) {document.selection.empty();}
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










const TextFormater = new function() {
  this.memberListToString = function(_members, _maxLength = 25) {
    if (!_members || !_members.length) return "";

    let memberText = _members.map(function (_member) {return _member.name}).join(", ");
    return memberText.substr(0, _maxLength) + (memberText.length > _maxLength ? "..." : "");
  }
}