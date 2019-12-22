

function _Server_project_dataTypeTemplate(_projectId, _dataTypeTemplate) {
  this.DataType = Object.keys(_dataTypeTemplate)[0];
  this.DataTypeTemplate = _dataTypeTemplate[this.DataType];
  this.DataTypeIdKey = Object.keys(this.DataTypeTemplate)[0];

  let projectId = String(_projectId);
  let This = this;
  
  this.get = function (_id) {return this.DB.get(_id);};

  this.update = function(_newItem) {
    let newItem = _filterData(_newItem);
    if (!newItem) return false;
  
    return this.DB.update(newItem);;
  }


  this.remove = function(_id, _removeFromServer = true) {
    if (_removeFromServer) this.DB.remove(_id);
    for (let i = 0; i < this.list.length; i++)
    {
      if (this.list[i][this.DataTypeIdKey] != _id) continue;
      this.list.splice(i, 1);
      return true;
    }
    return false;
  }




  this.DB = new function() {
    this.update = function(_newItem) {
      let parameters = "projectId=" + projectId + "&method=update&parameter=" + Encoder.objToString(_newItem);
      return REQUEST.send("database/project/" + This.DataType + ".php", parameters).then(
        function (_result) {
          if (typeof _result != "object") return;
          _result.projectId = projectId;
          return _result;
        }
      ).catch(function () {});
    }
   

    this.get = function(_id) {
      let parameters = "projectId=" + projectId + "&method=get&parameter=" + _id;
      return REQUEST.send("database/project/" + This.DataType + ".php", parameters).then(
        function (_result) {
          if (typeof _result != "object") return false;
          _result.projectId = projectId;
          return _result;
        }
      ).catch(function () {});
    }

    this.remove = function(_id) {
      let parameters = "projectId=" + projectId + "&method=remove&parameter=" + _id;
      REQUEST.send("database/project/" + This.DataType + ".php", parameters).then(
        function (_result) {
          console.warn("REMOVE: " + _id, _result);
        }
      ).catch(function () {});
    }


    this.getAll = function() {
      let parameters = "projectId=" + projectId + "&method=getAll"
      return REQUEST.send("database/project/" + This.DataType + ".php", parameters).then(
        function (_results) {
          if (typeof _results != "object") return false;
          for (let i = 0; i < _results.length; i++) This.update(_results[i], false);
        }
      ).catch(function () {});
    }

  }








  function _filterData(_data) {
    _data = Encoder.decodeObj(_data);

    let data = {};
    let keys = Object.keys(This.DataTypeTemplate);

    if (!_data[keys[0]]) _data[keys[0]] = newId();

    for (let i = 0; i < keys.length; i++) 
    {
      let curKey  = keys[i];
      let curKeyType = This.DataTypeTemplate[keys[i]];
      
      if (!_data[curKey]) _data[curKey] = "";

      let curValue = __valueToType(_data[curKey], curKeyType);
      data[curKey] = curValue;
    }
    return data;
  }
    function __valueToType(_value, _type = "int") {
      switch (_type) 
      {
        case "String":  return String(_value);     break;
        case "Array":   
          if (typeof _value == "object" && typeof _value.length == "number") return _value;
          if (!_value) return [];
          return Array(_value);
        break;
        case "float":   return parseFloat(_value); break;
        case "Boolean": return Boolean(_value);    break;
        default:        return parseInt(_value);   break;
      }
    }

}








