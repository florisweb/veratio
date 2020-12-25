
let RightClick = new _RightClick();
function _RightClick() {
  let list = [];

  this.register = function(_item, _callBack) {
    if (!_item) return false;

    let id = newId();
    _item.addEventListener(
      "contextmenu", 
      function (_event) {handleClick(id, _event);}
    );

    
    list.push({
      html: _item,
      callBack: _callBack,
      id: id,
    });
  }

  function get(_id) {
    for (let i = 0; i < list.length; i++)
    {
      if (list[i].id == _id) return list[i];
    }
    return false;
  }

  function handleClick(_id, _event) {
    let item = get(_id);
    if (!item) return false;    
    
    _event.preventDefault();

    var isRightMB;
    _event = _event || window.event;

    if ("which" in _event)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = _event.which == 3; 
    else if ("button" in _event)  // IE, Opera 
        isRightMB = _event.button == 2; 
    if (!isRightMB) return;

    
    try {
      item.callBack(_event, item.html);
    }
    catch (e) {console.error("RightClick.handleClick: An error accured:", e);}
    clearSelection();
    
    return false;
  }
}

