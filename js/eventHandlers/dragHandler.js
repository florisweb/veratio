
document.onmousedown = function() { 
  DragHandler.mouseDown = true;
}
document.onmouseup = function() {
  DragHandler.mouseDown = false;
}



let DragHandler = new _DragHandler();
function _DragHandler() {
  let list = [];
  let This = this;

  this.mouseDown = false;

  this.CurDragId = false;
  
  document.body.addEventListener("mousemove", 
    function (_event) {
      if (!This.CurDragId) return;
      This.dragHandler(This.CurDragId, _event);
    }
  )
  document.body.addEventListener("mouseup", 
    function (_event) {
      if (!This.CurDragId) return;
      This.finishDraging(This.CurDragId, _event);
    }
  );
  

  this.register = function(_item, _moveCallBack, _finishDragingCallback, _cancelDragingCallback) {
    if (!_item) return false;
    let id = newId();

     _item.addEventListener("mousedown", 
      function (_event) {
        This.startDraging(id, _event);
      }
    );
    

    list.push({
      html: _item,
      moveCallBack: _moveCallBack, 
      finishDragingCallback: _finishDragingCallback,
      cancelDragingCallback: _cancelDragingCallback,
      id: id,
      draging: false,
      dragStarted: false,
      x: 0,
      y: 0,
      rx: 0,
      ry: 0,
      startDraging: new Date(),
      placeHolder: false
    });

    return id;
  }

  function get(_id) {
    for (let i = 0; i < list.length; i++)
    {
      if (list[i].id == _id) return list[i];
    }
  }

  
  this.constructor.prototype.startDraging = function(_id, _event) {
    let item = get(_id);
    if (!item) return false;
    item.draging = true;

    if (!_event) return false;
    let pos = item.html.getBoundingClientRect();
    item.rx = _event.x - pos.left;
    item.ry = _event.y - pos.top;
    
    item.startCoords = {
      x: _event.pageX - item.rx,
      y: _event.pageY - item.ry,
    }

    item.startDraging = new Date();
  }

  this.constructor.prototype.dragHandler = function(_id, _event) {
    let item = get(_id);
    if (!item || !item.draging) return false;
    if (!this.mouseDown) return This.finishDraging(_id, _event);
    if (!item.dragStarted) if (new Date() - item.startDraging > 100) 
    {
      DragHandler.CurDragId = _id;
      item.dragStarted = true;
      
      item.placeHolder = addPlaceHolderItem(item);
      item.placeHolder.classList.add("draging");

      item.html.classList.add("hide");
      document.body.classList.add("noselect");
    } else return false;


    item.x = _event.x - item.rx;
    item.y = _event.y - item.ry;
    item.placeHolder.style.left = item.x + "px";
    item.placeHolder.style.top  = item.y + "px";

    try {
      let dropTarget = dropTargetByEvent(_event);
      item.moveCallBack(item, dropTarget);
    }
    catch (e) {console.error("DragHandler: An error accured while trying to handle the moveCallBack", e)}
  }

  this.constructor.prototype.finishDraging = function(_id, _event) {
    let item = get(_id);
    if (!item || !item.draging || !item.dragStarted) return false;
    this.CurDragId = false;

    document.body.classList.remove("noselect");
    item.html.classList.remove("hide");

    item.draging = false;
    item.dragStarted = false;
   
    let dropCoords = {};
    try {
      let dropTarget = dropTargetByEvent(_event);
      dropCoords = item.finishDragingCallback(item, dropTarget);
    }

    catch (e) {console.error("DragHandler: An error accured while trying to handle the dropCallBack", e)}

    item.placeHolder.classList.remove("draging");
    if (!dropCoords) dropCoords = item.startCoords;

    item.placeHolder.style.left = dropCoords.x + "px";
    item.placeHolder.style.top  = dropCoords.y + "px";
    
    setTimeout(function () {
      removePlaceHolder(item);
    }, 500);
  }

  this.cancelDraging = function(_id) {    

    let item = get(_id);
    console.log(item); 
    if (!item || !item.draging || !item.dragStarted) return false;
    this.CurDragId = false;

    document.body.classList.remove("noselect");
    item.html.classList.remove("hide");

    item.draging = false;
    item.dragStarted = false;
   
    item.placeHolder.classList.remove("draging");

    item.placeHolder.style.left = item.startCoords.x + "px";
    item.placeHolder.style.top  = item.startCoords.y + "px";
    
    setTimeout(function () {
      removePlaceHolder(item);
    }, 500);

    try {
      item.cancelDragingCallback(item);
    }
    catch (e) {console.error("DragHandler: An error accured while trying to handle the dropCallBack", e)}
  }


  function dropTargetByEvent(_event) {
    let hoveringTarget = _event.target;

    if (hoveringTarget.classList.contains("dropTarget")) return hoveringTarget;
    return false;
  }




  function addPlaceHolderItem(item) {
    let placeHolderItem = item.html.cloneNode(true);
    placeHolderItem.setAttribute("id", "DragHandler_dragObject");
    document.body.append(placeHolderItem);

    return placeHolderItem;
  }

  function removePlaceHolder(item) {
    if (!item.placeHolder || !item.placeHolder.parentNode) return false;
    item.placeHolder.parentNode.removeChild(item.placeHolder);
  }
}





