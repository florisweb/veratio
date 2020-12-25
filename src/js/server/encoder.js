
const Encoder = new function() {
    this.encodeString = function (_string) {
      _string = _string.replace(/\+/g, "<plusSign>");
      return encodeURIComponent(_string);
    }
    
    this.decodeString = function (_string) {
      if (!_string) return false;
      _string = _string.replace(/\+/g, " ");
      
      try {
        _string = decodeURIComponent(_string);
      }
      catch (e) {}
      return _string.replace(/<plusSign>/g, "+");
    }


    this.objToString = function(_JSON) {
      let jsonStr = JSON.stringify(_JSON);      
      return this.encodeString(jsonStr);
    }


    this.decodeObj = function(_jsonObj) {
      let newObj = JSON.parse(JSON.stringify(_jsonObj));
      if (!newObj) return false;
      return recursivelyDecodeObj(newObj);
    }


    function recursivelyDecodeObj(_obj) {
      let keys = Object.keys(_obj);
      for (let k = 0; k < keys.length; k++)
      {
        if (typeof _obj[keys[k]] == "object") _obj[keys[k]] = recursivelyDecodeObj(_obj[keys[k]]);
        if (typeof _obj[keys[k]] != "string") continue;

        _obj[keys[k]] = Encoder.decodeString(_obj[keys[k]]);
      }
      return _obj;
    }
}