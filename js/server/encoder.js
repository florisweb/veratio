
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
      let jsonStr = JSON.stringify(_jsonObj);
      jsonStr = this.decodeString(jsonStr);

      return JSON.parse(jsonStr);
    }
}