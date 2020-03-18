
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
      let result = recursivelyDecodeObj(newObj);
      this.list.push(result)
      return result;
    }


    function recursivelyDecodeObj(_obj) {
      let keys = Object.keys(_obj);
      for (key of keys)
      {
        if (typeof _obj[key] == "object") _obj[key] = recursivelyDecodeObj(_obj[key]);
        if (typeof _obj[key] != "string") continue;
        _obj[key] = Encoder.decodeString(_obj[key]);
      }
      return _obj;
    }

    this.list = [];
}