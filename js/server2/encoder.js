
const Encoder = new function() {
    this.objToString = function(_JSON) {
      let jsonStr = JSON.stringify(_JSON);
      jsonStr = jsonStr.replace(/\+/g, "<plusSign>");
      
      return encodeURIComponent(jsonStr);
    }

    this.encodeString = encodeURIComponent;


    this.decodeObj = function(_jsonObj) {
      let jsonStr = JSON.stringify(_jsonObj);
      jsonStr = jsonStr.replace(/<plusSign>/g, "+");
      
      return JSON.parse(jsonStr);
    }  
}