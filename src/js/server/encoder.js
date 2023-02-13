
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
      catch (e) {};
      return _string.replace(/<plusSign>/g, "+");
    }


    this.objToString = function(_obj) {
      let jsonStr = JSON.stringify(_obj);      
      return this.encodeString(jsonStr);
    }


    this.decodeObj = function(_obj) {
      let newObj = JSON.parse(JSON.stringify(_obj));
      if (!newObj) return false;
      return recursivelyDecodeObj(newObj);
    }

    this.decodeObjFromString = function(_str) {
      let newObj = JSON.parse(_str);
      if (!newObj) return false;
      return recursivelyDecodeObj(newObj);
    }


    function recursivelyDecodeObj(_obj) {
      if (!_obj) return _obj;
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