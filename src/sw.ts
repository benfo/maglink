import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { openDB } from "idb";

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);

// Initialize or upgrade our “share-db” database
async function getDb() {
  return openDB("share-db", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("shared")) {
        db.createObjectStore("shared", { keyPath: "id", autoIncrement: true });
      }
    },
  });
}

// Save incoming share; distinguish “plain text” vs “40-hex-char hash”
async function saveSharedData(raw: string) {
  const db = await getDb();
  const trimmed = raw.trim();
  // const hashPattern = /^[A-Fa-f0-9]{40}$/;
  // const entry = hashPattern.test(trimmed)
  //   ? { hash: trimmed }
  //   : { text: trimmed };
  await db.add("shared", { text: trimmed });
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    url.pathname === "/maglink/share-target" &&
    event.request.method === "POST"
  ) {
    event.respondWith(
      (async () => {
        const formData = await event.request.formData();
        const incoming = (formData.get("text") as string) || "";
        await saveSharedData(incoming);
        return Response.redirect("/maglink/incoming-share", 303);
      })()
    );
  }
});
