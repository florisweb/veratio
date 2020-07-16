

self.addEventListener('install', function(event) {
  console.warn("SW: Installed");
});


self.addEventListener('fetch', function(event) {
  console.log(event.request.method, event.request.headers);
 
});



// fetch(url, {
//   credentials: 'include'
// })