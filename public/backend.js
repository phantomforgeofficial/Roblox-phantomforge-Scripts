addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.pathname === "/api/config") {
    event.respondWith(fetch(url.origin + "/public/config.json"));
    return;
  }
  event.respondWith(new Response("Not found", { status: 404 }));
});
