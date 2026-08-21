/* =========================================================
   GitScope — Service Worker
   PWA offline caching and asset management
   ========================================================= */

"use strict";

const CACHE_NAME = "gitscope-v1.0.2";

const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.json",

    /* CSS */
    "./css/reset.css",
    "./css/variables.css",
    "./css/style.css",
    "./css/responsive.css",

    /* JavaScript */
    "./js/config.js",
    "./js/api.js",
    "./js/storage.js",
    "./js/charts.js",
    "./js/ui.js",
    "./js/app.js",

    /* Local Chart.js */
    "./assets/vendor/chart.umd.min.js",

    /* Favicon */
    "./assets/favicon.png"
];


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener("install", event => {

    console.log(
        "[GitScope] Service Worker installing — v1.0.2"
    );

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(cache => {

                /*
                 * Cache files individually so one missing
                 * optional file does not break installation.
                 */

                return Promise.all(

                    APP_SHELL.map(file =>

                        cache.add(file)
                            .catch(error => {

                                console.warn(
                                    `[GitScope] Failed to cache: ${file}`,
                                    error
                                );

                            })

                    )

                );

            })

            .then(() => self.skipWaiting())

    );

});


/* =========================================================
   ACTIVATE
   ========================================================= */

self.addEventListener("activate", event => {

    console.log(
        "[GitScope] Service Worker activating — v1.0.2"
    );

    event.waitUntil(

        caches.keys()

            .then(cacheNames => {

                return Promise.all(

                    cacheNames

                        .filter(
                            cacheName =>
                                cacheName !== CACHE_NAME
                        )

                        .map(
                            cacheName =>
                                caches.delete(cacheName)
                        )

                );

            })

            .then(() => self.clients.claim())

    );

});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener("fetch", event => {

    const request = event.request;

    if (request.method !== "GET") {
        return;
    }


    /* =====================================================
       GITHUB API
       ===================================================== */

    if (
        request.url.includes("api.github.com")
    ) {

        event.respondWith(

            fetch(request)

                .catch(() => {

                    return new Response(

                        JSON.stringify({
                            error: "You are offline."
                        }),

                        {
                            status: 503,

                            headers: {
                                "Content-Type":
                                    "application/json"
                            }
                        }

                    );

                })

        );

        return;
    }


    /* =====================================================
       EXTERNAL RESOURCES
       ===================================================== */

    if (
        request.url.includes("fonts.googleapis.com") ||
        request.url.includes("fonts.gstatic.com")
    ) {

        event.respondWith(

            fetch(request)

                .then(response => {

                    if (
                        response &&
                        response.status === 200
                    ) {

                        const clone =
                            response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache =>
                                cache.put(
                                    request,
                                    clone
                                )
                            );

                    }

                    return response;

                })

                .catch(() =>
                    caches.match(request)
                )

        );

        return;
    }


    /* =====================================================
       LOCAL APP FILES
       CACHE FIRST → NETWORK FALLBACK
       ===================================================== */

    event.respondWith(

        caches.match(request)

            .then(cachedResponse => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)

                    .then(response => {

                        if (
                            response &&
                            response.status === 200 &&
                            response.type !== "opaque"
                        ) {

                            const clone =
                                response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache =>
                                    cache.put(
                                        request,
                                        clone
                                    )
                                );

                        }

                        return response;

                    });

            })

    );

});


/* =========================================================
   MESSAGE
   ========================================================= */

self.addEventListener("message", event => {

    if (
        event.data &&
        event.data.type === "SKIP_WAITING"
    ) {

        self.skipWaiting();

    }

});


/* =========================================================
   READY
   ========================================================= */

console.log(
    "[GitScope] Service Worker loaded — v1.0.2"
);