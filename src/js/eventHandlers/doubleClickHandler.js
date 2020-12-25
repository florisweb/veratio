
let DoubleClick = new _DoubleClick();
function _DoubleClick() {
  let list = [];
  let doubleClickThreshold = 200; // < milliseconds

  this.register = function(_item, _callBack) {
    if (!_item) return false;

    let id = newId();
    _item.addEventListener(
      "click", 
      function (_event) {handleClick(id, _event);}
    );

    list.push({
      html: _item,
      callBack: _callBack,
      id: id,
      lastClicked: new Date()
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

    let curDate = new Date();
    if (curDate - item.lastClicked < doubleClickThreshold)
    {
      try {
        item.callBack(_event, item.html);
      }
      catch (e) {console.error("DoubleClick.handleClick: An error accured:", e)}
    }
    item.lastClicked = curDate;
  }
}

