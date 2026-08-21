/* =========================================================
   GitScope — GitHub API Service
   Handles all GitHub API communication
   ========================================================= */

"use strict";


/* =========================================================
   API SERVICE
   ========================================================= */

const GitHubAPI = (() => {

    /* -----------------------------------------------------
       Internal request helper
    ----------------------------------------------------- */

    async function request(
        endpoint,
        options = {}
    ) {

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                APP_CONFIG.GITHUB.REQUEST_TIMEOUT
            );

        try {

            const response =
                await fetch(
                    endpoint,
                    {
                        ...options,

                        signal:
                            controller.signal,

                        headers: {
                            Accept:
                                "application/vnd.github+json",

                            "X-GitHub-Api-Version":
                                "2022-11-28",

                            ...options.headers
                        }
                    }
                );


            /* ---------------------------------------------
               Rate limit
            --------------------------------------------- */

            if (
                response.status === 403 ||
                response.status === 429
            ) {

                const remaining =
                    response.headers.get(
                        "X-RateLimit-Remaining"
                    );

                if (
                    remaining === "0" ||
                    response.status === 429
                ) {

                    throw createAPIError(
                        APP_CONFIG.ERRORS.RATE_LIMIT,
                        "RATE_LIMIT",
                        response.status
                    );
                }
            }


            /* ---------------------------------------------
               User not found
            --------------------------------------------- */

            if (response.status === 404) {

                throw createAPIError(
                    APP_CONFIG.ERRORS.USER_NOT_FOUND,
                    "NOT_FOUND",
                    response.status
                );
            }


            /* ---------------------------------------------
               Other HTTP errors
            --------------------------------------------- */

            if (!response.ok) {

                throw createAPIError(
                    APP_CONFIG.ERRORS.UNKNOWN,
                    "HTTP_ERROR",
                    response.status
                );
            }


            /* ---------------------------------------------
               JSON response
            --------------------------------------------- */

            return await response.json();

        } catch (error) {

            if (
                error.name === "AbortError"
            ) {

                throw createAPIError(
                    APP_CONFIG.ERRORS.TIMEOUT,
                    "TIMEOUT"
                );
            }


            if (
                error.name === "TypeError"
            ) {

                throw createAPIError(
                    APP_CONFIG.ERRORS.NETWORK,
                    "NETWORK"
                );
            }


            throw error;

        } finally {

            clearTimeout(timeout);
        }
    }


    /* -----------------------------------------------------
       Custom API error
    ----------------------------------------------------- */

    function createAPIError(
        message,
        type = "UNKNOWN",
        status = null
    ) {

        const error =
            new Error(message);

        error.type = type;
        error.status = status;
        error.isGitScopeError = true;

        return error;
    }


    /* =====================================================
       USER
       ===================================================== */

    async function getUser(
        username
    ) {

        const normalized =
            normalizeUsername(username);


        if (
            !isValidGitHubUsername(normalized)
        ) {

            throw createAPIError(
                APP_CONFIG.ERRORS.INVALID_USERNAME,
                "INVALID_USERNAME"
            );
        }


        const url =
            getEndpoint(
                "USER",
                {
                    username: normalized
                }
            );


        return await request(url);
    }


    /* =====================================================
       REPOSITORIES
       ===================================================== */

    async function getRepositories(
        username,
        options = {}
    ) {

        const normalized =
            normalizeUsername(username);


        if (
            !isValidGitHubUsername(normalized)
        ) {

            throw createAPIError(
                APP_CONFIG.ERRORS.INVALID_USERNAME,
                "INVALID_USERNAME"
            );
        }


        const {

            sort =
                APP_CONFIG.DEFAULT_REPOSITORY_SORT,

            direction =
                APP_CONFIG.DEFAULT_REPOSITORY_DIRECTION,

            perPage =
                APP_CONFIG.GITHUB.PER_PAGE,

            page = 1

        } = options;


        const endpoint =
            getEndpoint(
                "REPOSITORIES",
                {
                    username: normalized
                }
            );


        const url =
            new URL(endpoint);

        url.searchParams.set(
            "sort",
            sort
        );

        url.searchParams.set(
            "direction",
            direction
        );

        url.searchParams.set(
            "per_page",
            Math.min(
                perPage,
                APP_CONFIG.GITHUB.PER_PAGE
            )
        );

        url.searchParams.set(
            "page",
            page
        );


        return await request(
            url.toString()
        );
    }


    /* =====================================================
       GET ALL REPOSITORIES
       ===================================================== */

    async function getAllRepositories(
        username
    ) {

        const allRepositories = [];

        let page = 1;

        const perPage =
            APP_CONFIG.GITHUB.PER_PAGE;


        while (
            allRepositories.length <
            APP_CONFIG.GITHUB.MAX_REPOSITORIES
        ) {

            const repositories =
                await getRepositories(
                    username,
                    {
                        sort:
                            APP_CONFIG.DEFAULT_REPOSITORY_SORT,

                        direction:
                            APP_CONFIG.DEFAULT_REPOSITORY_DIRECTION,

                        perPage,

                        page
                    }
                );


            if (
                !Array.isArray(repositories) ||
                repositories.length === 0
            ) {

                break;
            }


            allRepositories.push(
                ...repositories
            );


            if (
                repositories.length < perPage
            ) {

                break;
            }


            page++;


            if (page > 10) {
                break;
            }
        }


        return allRepositories.slice(
            0,
            APP_CONFIG.GITHUB.MAX_REPOSITORIES
        );
    }


    /* =====================================================
       PUBLIC EVENTS
       ===================================================== */

    async function getEvents(
        username,
        options = {}
    ) {

        const normalized =
            normalizeUsername(username);


        if (
            !isValidGitHubUsername(normalized)
        ) {

            throw createAPIError(
                APP_CONFIG.ERRORS.INVALID_USERNAME,
                "INVALID_USERNAME"
            );
        }


        const endpoint =
            getEndpoint(
                "EVENTS",
                {
                    username: normalized
                }
            );


        const url =
            new URL(endpoint);


        url.searchParams.set(
            "per_page",
            options.perPage || 100
        );


        if (options.page) {

            url.searchParams.set(
                "page",
                options.page
            );
        }


        return await request(
            url.toString()
        );
    }


    /* =====================================================
       FOLLOWERS
       ===================================================== */

    async function getFollowers(
        username,
        page = 1
    ) {

        const normalized =
            normalizeUsername(username);


        const endpoint =
            getEndpoint(
                "FOLLOWERS",
                {
                    username: normalized
                }
            );


        const url =
            new URL(endpoint);


        url.searchParams.set(
            "per_page",
            100
        );

        url.searchParams.set(
            "page",
            page
        );


        return await request(
            url.toString()
        );
    }


    /* =====================================================
       FOLLOWING
       ===================================================== */

    async function getFollowing(
        username,
        page = 1
    ) {

        const normalized =
            normalizeUsername(username);


        const endpoint =
            getEndpoint(
                "FOLLOWING",
                {
                    username: normalized
                }
            );


        const url =
            new URL(endpoint);


        url.searchParams.set(
            "per_page",
            100
        );

        url.searchParams.set(
            "page",
            page
        );


        return await request(
            url.toString()
        );
    }


    /* =====================================================
       COMPLETE PROFILE DATA
       ===================================================== */

    async function getCompleteProfile(
        username
    ) {

        const normalized =
            normalizeUsername(username);


        if (
            !isValidGitHubUsername(normalized)
        ) {

            throw createAPIError(
                APP_CONFIG.ERRORS.INVALID_USERNAME,
                "INVALID_USERNAME"
            );
        }


        /*
         * Profile is requested first.
         * Repository and event requests are then
         * performed together to save time.
         */

        const user =
            await getUser(normalized);


        const [
            repositories,
            events
        ] =
            await Promise.all([
                getAllRepositories(normalized),
                getEvents(normalized)
            ]);


        return {

            user,

            repositories,

            events,

            fetchedAt:
                new Date().toISOString()

        };
    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    return Object.freeze({

        getUser,

        getRepositories,

        getAllRepositories,

        getEvents,

        getFollowers,

        getFollowing,

        getCompleteProfile

    });

})();


/* =========================================================
   GLOBAL EXPORT
   ========================================================= */

window.GitHubAPI = GitHubAPI;


/* =========================================================
   DEVELOPMENT CHECK
   ========================================================= */

console.log(
    "[GitScope] GitHub API service loaded."
);