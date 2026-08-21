/* =========================================================
   GitScope — Configuration
   Central application settings
   ========================================================= */

"use strict";


/* =========================================================
   APP CONFIGURATION
   ========================================================= */

const APP_CONFIG = Object.freeze({

    /* -----------------------------------------------------
       Application
    ----------------------------------------------------- */

    APP_NAME: "GitScope",

    APP_VERSION: "1.0.0",

    APP_DESCRIPTION:
        "A futuristic GitHub profile analytics dashboard.",


    /* -----------------------------------------------------
       GitHub
    ----------------------------------------------------- */

    GITHUB: Object.freeze({

        API_BASE_URL:
            "https://api.github.com",

        WEBSITE_URL:
            "https://github.com",

        DEFAULT_USERNAME:
            "",

        PER_PAGE:
            100,

        MAX_REPOSITORIES:
            100,

        REQUEST_TIMEOUT:
            15000
    }),


    /* -----------------------------------------------------
       API Endpoints
    ----------------------------------------------------- */

    ENDPOINTS: Object.freeze({

        USER:
            "/users/{username}",

        REPOSITORIES:
            "/users/{username}/repos",

        EVENTS:
            "/users/{username}/events/public",

        FOLLOWERS:
            "/users/{username}/followers",

        FOLLOWING:
            "/users/{username}/following"
    }),


    /* -----------------------------------------------------
       Repository Sorting
    ----------------------------------------------------- */

    REPOSITORY_SORT:

        Object.freeze({

            STARS:
                "stars",

            FORKS:
                "forks",

            UPDATED:
                "updated",

            CREATED:
                "created",

            PUSHED:
                "pushed",

            FULL_NAME:
                "full_name"
        }),


    /* -----------------------------------------------------
       Repository Defaults
    ----------------------------------------------------- */

    DEFAULT_REPOSITORY_SORT:
        "updated",

    DEFAULT_REPOSITORY_DIRECTION:
        "desc",


    /* -----------------------------------------------------
       UI
    ----------------------------------------------------- */

    UI: Object.freeze({

        REPOSITORIES_PER_PAGE:
            6,

        MAX_HISTORY_ITEMS:
            8,

        TOAST_DURATION:
            3000,

        SEARCH_MIN_LENGTH:
            1,

        CHART_ANIMATION_DURATION:
            800
    }),


    /* -----------------------------------------------------
       Local Storage Keys
    ----------------------------------------------------- */

    STORAGE_KEYS: Object.freeze({

        SEARCH_HISTORY:
            "gitscope_search_history",

        LAST_USERNAME:
            "gitscope_last_username",

        THEME:
            "gitscope_theme"
    }),


    /* -----------------------------------------------------
       Chart Configuration
    ----------------------------------------------------- */

    CHARTS: Object.freeze({

        MAX_LANGUAGES:
            6,

        MAX_REPOSITORIES:
            6,

        MAX_ACTIVITY_POINTS:
            12
    }),


    /* -----------------------------------------------------
       Error Messages
    ----------------------------------------------------- */

    ERRORS: Object.freeze({

        EMPTY_USERNAME:
            "Please enter a GitHub username.",

        INVALID_USERNAME:
            "Please enter a valid GitHub username.",

        USER_NOT_FOUND:
            "GitHub user not found.",

        RATE_LIMIT:
            "GitHub API rate limit reached. Please try again later.",

        NETWORK:
            "Unable to connect to GitHub. Check your internet connection.",

        TIMEOUT:
            "The request took too long. Please try again.",

        UNKNOWN:
            "Something went wrong. Please try again."
    }),


    /* -----------------------------------------------------
       GitHub Username Validation
    ----------------------------------------------------- */

    VALIDATION: Object.freeze({

        USERNAME_PATTERN:
            /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37})$/,

        MAX_USERNAME_LENGTH:
            39
    })

});


/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

/**
 * Build a GitHub API URL.
 *
 * @param {string} endpoint
 * @param {Object} params
 * @returns {string}
 */
function buildApiUrl(endpoint, params = {}) {

    let finalEndpoint = endpoint;

    Object.entries(params).forEach(
        ([key, value]) => {

            finalEndpoint = finalEndpoint.replace(
                `{${key}}`,
                encodeURIComponent(value)
            );
        }
    );

    return `${APP_CONFIG.GITHUB.API_BASE_URL}${finalEndpoint}`;
}


/**
 * Validate a GitHub username.
 *
 * @param {string} username
 * @returns {boolean}
 */
function isValidGitHubUsername(username) {

    if (
        typeof username !== "string" ||
        username.trim().length === 0
    ) {
        return false;
    }

    const cleanUsername =
        username.trim();

    if (
        cleanUsername.length >
        APP_CONFIG.VALIDATION.MAX_USERNAME_LENGTH
    ) {
        return false;
    }

    return APP_CONFIG.VALIDATION.USERNAME_PATTERN.test(
        cleanUsername
    );
}


/**
 * Clean user input.
 *
 * @param {string} username
 * @returns {string}
 */
function normalizeUsername(username) {

    if (typeof username !== "string") {
        return "";
    }

    return username
        .trim()
        .replace(/^@/, "")
        .replace(/\/+$/, "");
}


/**
 * Create endpoint from configuration.
 *
 * @param {string} endpointName
 * @param {Object} params
 * @returns {string}
 */
function getEndpoint(endpointName, params = {}) {

    const endpoint =
        APP_CONFIG.ENDPOINTS[endpointName];

    if (!endpoint) {
        throw new Error(
            `Unknown API endpoint: ${endpointName}`
        );
    }

    return buildApiUrl(
        endpoint,
        params
    );
}


/* =========================================================
   GLOBAL EXPORT
   ========================================================= */

window.GitScopeConfig = Object.freeze({

    APP_CONFIG,

    buildApiUrl,

    getEndpoint,

    isValidGitHubUsername,

    normalizeUsername

});


/* =========================================================
   DEVELOPMENT CHECK
   ========================================================= */

console.log(
    `[GitScope] Configuration loaded — v${APP_CONFIG.APP_VERSION}`
);