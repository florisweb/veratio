

let DragHandler = new _DragHandler();
function _DragHandler() {
  let This = this;

  this.curDragItem = false;
  document.body.ondragend = function(_e) {
    if (!DragHandler.curDragItem) return;
    dropHandler(_e.target, _e, DragHandler.curDragItem.onDropHandler);
  }

  this.registerDropRegion = function(_html) {
    _html.addEventListener("dragover", function(_e) {
      _e.preventDefault();
      _html.classList.add("showDropRegion");
    });

    _html.addEventListener("dragleave", function() {
      _html.classList.remove("showDropRegion");
    });

    _html.addEventListener("drop", function(_e) {
      dropHandler(_html, _e, DragHandler.curDragItem.onDropHandler);
    });
  }

  this.register = function(_html, _onDrop) {
    if (!_html) return;
    _html.onDropHandler = _onDrop;
    _html.setAttribute("draggable", true);
    _html.addEventListener("dragstart", function() {
      curDropTarget = false;
      This.curDragItem = _html;
      _html.classList.add("dragging");
    });

    this.registerDropRegion(_html);
  }

  let curDropTarget = false;
  function dropHandler(_html, _e, _onDrop) {
    if (_html != This.curDragItem) return curDropTarget = _html; // Fires twice: first for the item that is being dropped onto, and the second time for the item that is being dropped
    _html.classList.remove("dragging");

    let regions = $(".showDropRegion");
    for (let region of regions) region.classList.remove("showDropRegion");

    _e.preventDefault();

    let onDropTodoHolder;
    setTimeout(function () {
      _html.classList.remove("successfullDrop");
      if (!onDropTodoHolder) return;
      _onDrop(_html, onDropTodoHolder);
    }, 300);


    if (!curDropTarget) return;
    _html.classList.add("successfullDrop");

    if (curDropTarget.classList.contains('taskItem') && curDropTarget.classList.contains('listItem'))
    {
      onDropTodoHolder = curDropTarget.parentNode;
      if (!isDescendant(_html, _e.target)) return curDropTarget.parentNode.appendChild(_html);
      curDropTarget.parentNode.insertBefore(_html, curDropTarget.nextSibling);
      return;
    }
    
    if (curDropTarget.classList.contains('createTaskHolder'))
    {
      onDropTodoHolder = curDropTarget.parentNode.children[3];
      onDropTodoHolder.appendChild(_html);
      return;
    }

    if (curDropTarget.parentNode.classList.contains('taskHolder'))
    {
      onDropTodoHolder = curDropTarget.parentNode.children[3];
      onDropTodoHolder.insertBefore(_html, onDropTodoHolder.children[0]);
      return;
    }

    _html.classList.remove("successfullDrop");
  }
}





