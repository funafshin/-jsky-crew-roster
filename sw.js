const CACHE='jsky-roster-v3-2';
const APP_SHELL=['./','./index.html','./manifest.webmanifest'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
  )).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const req=e.request, url=new URL(req.url);
  if(req.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname.endsWith('/')){
    e.respondWith(
      fetch(req,{cache:'no-store'}).then(r=>{
        if(r&&r.ok){
          const copy=r.clone();
          caches.open(CACHE).then(c=>c.put('./index.html',copy));
        }
        return r;
      }).catch(()=>caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(caches.match(req).then(r=>r||fetch(req)));
});
