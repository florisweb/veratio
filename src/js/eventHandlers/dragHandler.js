// Classes
// dragging
// successfulDrop
// 

// showDropRegion
// - above holder (drops as the first item)       dropOnTop
// - actual item (drops underneath)               dragItem
// - underneath holder (drops as the last item)   dropOnBottom



let DragHandler = new _DragHandler();
function _DragHandler() {
  let This = this;

  this.curDragItem = false;
  this.curDropRegionId = false;
  let onDropCallBack;
  let getListHolder;
  document.body.ondragend = function(_e) {
    if (!DragHandler.curDragItem) return;
    dropHandler(_e.target, _e);
  }

  this.registerDropRegion = function(_html, _dropOnTop = false, _dropRegionId) {
    _html.classList.add(_dropOnTop ? 'dropOnTop' : 'dropOnBottom');

    _html.addEventListener("dragover", function(_e) {
      if (_dropRegionId != This.curDropRegionId) return;
      _e.preventDefault();
      _html.classList.add("showDropRegion");
    });

    _html.addEventListener("dragleave", function() {
      if (_dropRegionId != This.curDropRegionId) return;

      _html.classList.remove("showDropRegion");
    });

    _html.addEventListener("drop", function(_e) {
      if (_dropRegionId != This.curDropRegionId) return;
      dropHandler(_html, _e);
    });
  }

  this.register = function(_html, _onDrop, _getListHolder, _dropRegionId) {
    if (!_html) return;
    _html.classList.add('dragItem');
    _html.setAttribute("draggable", true);

    _html.addEventListener("dragstart", function() {
      onDropCallBack        = _onDrop;
      getListHolder         = _getListHolder;
      curDropTarget         = false;

      This.curDragItem      = _html;
      This.curDropRegionId  = _dropRegionId;
      _html.classList.add("dragging");
    });

    this.registerDropRegion(_html, false, _dropRegionId);
  }

  let curDropTarget = false;
  function dropHandler(_html, _e) {
    if (_html != This.curDragItem) return curDropTarget = _html; // Fires twice: first for the item that is being dropped onto, and the second time for the item that is being dropped
    _html.classList.remove("dragging");

    let regions = $(".showDropRegion");
    for (let region of regions) region.classList.remove("showDropRegion");

    _e.preventDefault();

    let onDropTodoHolder;
    setTimeout(function () {
      _html.classList.remove("successfulDrop");
      if (!curDropTarget) return;
      
      let index = -1;
      for (let i = 0; i < onDropTodoHolder.children.length; i++)
      {
        if (onDropTodoHolder.children[i].id != _html.id) continue;
        index = i;
        break;
      }

      onDropCallBack(_html, curDropTarget, onDropTodoHolder, index);
    }, 300);


    if (!curDropTarget) return;
    _html.classList.add("successfulDrop");

    if (curDropTarget.classList.contains('dragItem'))
    {
      onDropTodoHolder = curDropTarget.parentNode;
      // if (!isDescendant(_html, _e.target)) return curDropTarget.parentNode.appendChild(_html);
      curDropTarget.parentNode.insertBefore(_html, curDropTarget.nextSibling);
      return;
    }
    
    if (curDropTarget.classList.contains('dropOnBottom'))
    {
      onDropTodoHolder = getListHolder(curDropTarget);
      onDropTodoHolder.appendChild(_html);
      return;
    }

    if (curDropTarget.classList.contains('dropOnTop'))
    {
      onDropTodoHolder = getListHolder(curDropTarget);
      onDropTodoHolder.insertBefore(_html, onDropTodoHolder.children[0]);
      return;
    }

    _html.classList.remove("successfulDrop");
  }
}





