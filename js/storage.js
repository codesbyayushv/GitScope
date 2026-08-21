/* =========================================================
   GitScope — Local Storage Service
   Handles search history and local application data
   ========================================================= */

"use strict";


/* =========================================================
   STORAGE SERVICE
   ========================================================= */

const GitScopeStorage = (() => {


    /* =====================================================
       INTERNAL HELPERS
       ===================================================== */

    function isStorageAvailable() {

        try {

            const testKey =
                "__gitscope_storage_test__";

            localStorage.setItem(
                testKey,
                "1"
            );

            localStorage.removeItem(
                testKey
            );

            return true;

        } catch (error) {

            return false;
        }
    }


    function read(
        key,
        fallback = null
    ) {

        if (!isStorageAvailable()) {
            return fallback;
        }

        try {

            const value =
                localStorage.getItem(key);

            if (value === null) {
                return fallback;
            }

            return JSON.parse(value);

        } catch (error) {

            console.warn(
                `[GitScope] Unable to read storage key: ${key}`,
                error
            );

            return fallback;
        }
    }


    function write(
        key,
        value
    ) {

        if (!isStorageAvailable()) {
            return false;
        }

        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            return true;

        } catch (error) {

            console.warn(
                `[GitScope] Unable to write storage key: ${key}`,
                error
            );

            return false;
        }
    }


    function remove(
        key
    ) {

        if (!isStorageAvailable()) {
            return false;
        }

        try {

            localStorage.removeItem(key);

            return true;

        } catch (error) {

            console.warn(
                `[GitScope] Unable to remove storage key: ${key}`,
                error
            );

            return false;
        }
    }


    /* =====================================================
       SEARCH HISTORY
       ===================================================== */

    function getSearchHistory() {

        const history =
            read(
                APP_CONFIG.STORAGE_KEYS.SEARCH_HISTORY,
                []
            );


        if (!Array.isArray(history)) {
            return [];
        }


        return history;
    }


    function addSearch(
        username
    ) {

        const normalized =
            normalizeUsername(username);


        if (
            !normalized ||
            !isValidGitHubUsername(normalized)
        ) {

            return getSearchHistory();
        }


        const history =
            getSearchHistory();


        /*
         * Remove duplicate username.
         * GitHub usernames are case-insensitive.
         */

        const filtered =
            history.filter(
                item =>
                    item.toLowerCase() !==
                    normalized.toLowerCase()
            );


        /*
         * Newest search goes first.
         */

        filtered.unshift(
            normalized
        );


        /*
         * Keep only configured number
         * of recent searches.
         */

        const limited =
            filtered.slice(
                0,
                APP_CONFIG.UI.MAX_HISTORY_ITEMS
            );


        write(
            APP_CONFIG.STORAGE_KEYS.SEARCH_HISTORY,
            limited
        );


        return limited;
    }


    function removeSearch(
        username
    ) {

        const normalized =
            normalizeUsername(username);


        const history =
            getSearchHistory();


        const updated =
            history.filter(
                item =>
                    item.toLowerCase() !==
                    normalized.toLowerCase()
            );


        write(
            APP_CONFIG.STORAGE_KEYS.SEARCH_HISTORY,
            updated
        );


        return updated;
    }


    function clearSearchHistory() {

        return remove(
            APP_CONFIG.STORAGE_KEYS.SEARCH_HISTORY
        );
    }


    /* =====================================================
       LAST USERNAME
       ===================================================== */

    function getLastUsername() {

        return read(
            APP_CONFIG.STORAGE_KEYS.LAST_USERNAME,
            ""
        );
    }


    function setLastUsername(
        username
    ) {

        const normalized =
            normalizeUsername(username);


        if (
            !normalized ||
            !isValidGitHubUsername(normalized)
        ) {

            return false;
        }


        return write(
            APP_CONFIG.STORAGE_KEYS.LAST_USERNAME,
            normalized
        );
    }


    function clearLastUsername() {

        return remove(
            APP_CONFIG.STORAGE_KEYS.LAST_USERNAME
        );
    }


    /* =====================================================
       THEME
       ===================================================== */

    function getTheme() {

        return read(
            APP_CONFIG.STORAGE_KEYS.THEME,
            "dark"
        );
    }


    function setTheme(
        theme
    ) {

        const allowedThemes = [
            "dark",
            "light",
            "system"
        ];


        if (
            !allowedThemes.includes(theme)
        ) {

            return false;
        }


        return write(
            APP_CONFIG.STORAGE_KEYS.THEME,
            theme
        );
    }


    /* =====================================================
       EXPORT ALL DATA
       ===================================================== */

    function exportData() {

        return {

            searchHistory:
                getSearchHistory(),

            lastUsername:
                getLastUsername(),

            theme:
                getTheme(),

            exportedAt:
                new Date().toISOString()
        };
    }


    /* =====================================================
       CLEAR ALL GITSCOPE DATA
       ===================================================== */

    function clearAll() {

        const keys = [
            APP_CONFIG.STORAGE_KEYS.SEARCH_HISTORY,
            APP_CONFIG.STORAGE_KEYS.LAST_USERNAME,
            APP_CONFIG.STORAGE_KEYS.THEME
        ];


        keys.forEach(
            key => remove(key)
        );


        return true;
    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    return Object.freeze({

        getSearchHistory,

        addSearch,

        removeSearch,

        clearSearchHistory,

        getLastUsername,

        setLastUsername,

        clearLastUsername,

        getTheme,

        setTheme,

        exportData,

        clearAll,

        isStorageAvailable

    });

})();


/* =========================================================
   GLOBAL EXPORT
   ========================================================= */

window.GitScopeStorage =
    GitScopeStorage;


/* =========================================================
   DEVELOPMENT CHECK
   ========================================================= */

console.log(
    "[GitScope] Storage service loaded."
);