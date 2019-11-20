

const REQUEST = new function() {
  this.send = function(_url = "", _paramaters = "", _maxAttempts = 1) {
    let request = createRequestObject(_url, _paramaters, _maxAttempts);
    sendRequest(request);
    return request.promise;
  }

  function createRequestObject(_url, _paramaters, _maxAttempts) {
    let requestObj = {
      url:          String(_url),
      paramaters:   String(_paramaters),
      
      maxAttempts:  parseInt(_maxAttempts),
      attempts:     0,
      isExpired:    requestIsExpired
    }; 

    requestObj.promise = new Promise(
        function (resolve, reject)
        {
          requestObj.resolve = resolve;
          requestObj.reject = reject;
        }
    );

    return requestObj; 
  }

  function requestIsExpired() {
    return this.attempts >= this.maxAttempts;
  }


  
  function sendRequest(_request) {
    _request.attempts++;
    
    sendActualRequest(_request).then(
      _request.resolve
    ).catch(
      function(_error) {
        if (_request.isExpired()) return _request.reject(_error);
        setTimeout(sendRequest, 1000, _request); //try again
      }
    )
  }


  function sendActualRequest(_request) {
    return new Promise(
      async function (resolve, reject)
      {
        let response = await fetch(_request.url, 
        {
          credentials: 'same-origin',
          method: 'POST',
          body: _request.paramaters,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        let result = await response.json();
        if (response.status == "200") return resolve(result);
        reject(result);
      }
    );
  }
}