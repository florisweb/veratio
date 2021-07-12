

let DragHandler = new _DragHandler();
function _DragHandler() {
  let This = this;

  this.curDragItem = false;
  document.body.ondragend = function(_e) {
    if (!DragHandler.curDragItem) return;
    dropHandler(_e.target, _e, DragHandler.curDragItem.onDropHandler);
  }

  this.register = function(_html, _onDrop) {
    if (!_html) return;
    _html.onDropHandler = _onDrop;
    _html.setAttribute("draggable", true);
    _html.addEventListener("dragstart", function() {
      This.curDragItem = _html;
      _html.classList.add("dragging");
    });

    _html.addEventListener("dragover", function(e) {
      e.preventDefault();
      _html.classList.add("showDropRegion");
    });

    _html.addEventListener("dragleave", function() {
      _html.classList.remove("showDropRegion");
    });

    _html.addEventListener("drop", function(_e) {
      dropHandler(_html, _e, _onDrop);
    });
  }

  let curDropTarget = false;
  function dropHandler(_html, _e, _onDrop) {
    _html.classList.remove("dragging");
    if (_html != This.curDragItem) return curDropTarget = _html;

    _e.preventDefault();

    
    let tasks = $(".taskItem.showDropRegion");
    for (task of tasks) task.classList.remove("showDropRegion");



    _html.classList.add("dropped");
    setTimeout(function () {
      _html.classList.remove("dropped");
      _html.classList.remove("showDropRegion");

      if (!curDropTarget) return;
      _onDrop(_html, curDropTarget.parentNode);
    }, 300);

    if (!curDropTarget) return;
    if (!isDescendant(_html, _e.target)) return curDropTarget.parentNode.appendChild(_html);
    console.log(curDropTarget.parentNode, curDropTarget, curDropTarget.nextSibling);
    curDropTarget.parentNode.insertBefore(_html, curDropTarget.nextSibling);
  }
}





