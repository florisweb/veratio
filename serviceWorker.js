// await SW.send({action: "getAll", type: "project", projectId: "test", parameters: ""})

self.addEventListener('install', function(event) {
  console.warn("SW: Installed", "V0.12.4");
  return self.skipWaiting();
});


self.addEventListener('fetch', function(event) {
  // console.log(event.request.method, event.request.headers);
 
});
