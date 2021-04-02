

let DragHandler = new _DragHandler();
function _DragHandler() {
  let This = this;

  this.curDragItem = false;
  document.body.ondragend = function(e) {
    dropHandler(e.target, e);
  }

  this.register = function(_html) {
    if (!_html) return;

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

    _html.addEventListener("drop", function(e) {
      dropHandler(_html, e);
    });
  }

  let curDropTarget = false;
  function dropHandler(_html, _e) {
    _html.classList.remove("dragging");
    if (_html != This.curDragItem) return curDropTarget = _html;

    _e.preventDefault();

    let tasks = $(".taskItem.showDropRegion");
    for (task of tasks) task.classList.remove("showDropRegion");

    _html.classList.add("dropped");
    setTimeout(function () {
      _html.classList.remove("dropped");
      _html.classList.remove("showDropRegion");
    }, 300);

    if (!isDescendant(_html, _e.target)) return curDropTarget.parentNode.appendChild(_html);
    curDropTarget.parentNode.insertBefore(_html, curDropTarget.nextSibling);
  }
}





