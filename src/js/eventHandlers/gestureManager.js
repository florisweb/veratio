
let GestureManager = new _GestureManager();
function _GestureManager() {
  const minDragDistanceSquared = Math.pow(40, 2);
  function register(_item, _onMove = () => {}, _onGestureEnd = () => {}) {
    if (!_item) return false;


    let touchStart = 0

    _item.addEventListener('touchstart', e => {
      touchStart = [e.changedTouches[0].screenX, e.changedTouches[0].screenY];
    });

    _item.addEventListener('touchmove', e => {
      let curPos = [e.changedTouches[0].screenX, e.changedTouches[0].screenY];
      let dx = touchStart[0] - curPos[0];
      let dy = touchStart[1] - curPos[1];
        
      _onMove(dx, dy, touchStart);
    });

    _item.addEventListener('touchend', e => {
      let curPos = [e.changedTouches[0].screenX, e.changedTouches[0].screenY];
      let dx = touchStart[0] - curPos[0];
      let dy = touchStart[1] - curPos[1];
        
      _onGestureEnd(dx, dy, touchStart);
    });
  }

  this.onSwipeLeft = function(_item, _callBack) {
    register(_item, function(_dx, _dy, _start) {
      if (Math.pow(_dx, 2) + Math.pow(_dy, 2) < minDragDistanceSquared) return;
      if (_dx > 0 && Math.abs(_dx / _dy) > 5) _callBack(_dx, _dy, _start);
    });
  }

  this.onSwipeRight = function(_item, _callBack) {
    register(_item, function(_dx, _dy, _start) {
      if (Math.pow(_dx, 2) + Math.pow(_dy, 2) < minDragDistanceSquared) return;
      if (_dx < 0 && Math.abs(_dx / _dy) > 5) _callBack(_dx, _dy, _start);
    });
  }
}

