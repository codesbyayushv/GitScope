/* =========================================================
   GitScope — Main Application Controller
   ========================================================= */

"use strict";


const GitScopeApp = (() => {

    const state = {
        currentUsername: "",
        currentData: null,
        isLoading: false,
        initialized: false
    };


    let searchForm = null;
    let searchInput = null;
    let analyzeButton = null;
    let retryButton = null;
    let refreshButton = null;
    let clearHistoryButton = null;


    /* =====================================================
       DOM
       ===================================================== */

    function cacheDOM() {

        searchForm =
            document.querySelector("#search-form");

        searchInput =
            document.querySelector("#username-input");

        analyzeButton =
            document.querySelector("#analyze-button");

        retryButton =
            document.querySelector("#retry-button");

        refreshButton =
            document.querySelector("#refresh-button");

        clearHistoryButton =
            document.querySelector("#clear-history");
    }


    /* =====================================================
       INIT
       ===================================================== */

    function init() {

        if (state.initialized) {
            return;
        }

        cacheDOM();

        bindEvents();

        GitScopeUI.cacheElements();

        GitScopeUI.renderHistory();

        restoreLastUsername();

        state.initialized = true;

        console.log(
            "[GitScope] Application initialized successfully."
        );
    }


    /* =====================================================
       EVENTS
       ===================================================== */

    function bindEvents() {

        /* Search form */

        searchForm?.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                handleSearch();
            }
        );


        /* Retry */

        retryButton?.addEventListener(
            "click",
            () => {

                if (state.currentUsername) {

                    loadProfile(
                        state.currentUsername
                    );

                } else {

                    handleSearch();
                }
            }
        );


        /* Refresh */

        refreshButton?.addEventListener(
            "click",
            () => {

                if (state.currentUsername) {

                    loadProfile(
                        state.currentUsername
                    );
                }
            }
        );


        /* Clear history */

        clearHistoryButton?.addEventListener(
            "click",
            () => {

                GitScopeStorage
                    .clearSearchHistory();

                GitScopeUI.renderHistory();

                document
                    .querySelector("#history-section")
                    ?.classList.add("hidden");

                GitScopeUI.showToast(
                    "Search history cleared.",
                    "success"
                );
            }
        );


        /* Input cleanup */

        searchInput?.addEventListener(
            "input",
            () => {

                searchInput.value =
                    searchInput.value
                        .replace(/\s+/g, "")
                        .replace(/^@/, "");
            }
        );
    }


    /* =====================================================
       SEARCH
       ===================================================== */

    async function handleSearch() {

        if (state.isLoading) {
            return;
        }


        const rawUsername =
            searchInput?.value?.trim() || "";


        const username =
            normalizeUsername(
                rawUsername
            );


        if (!username) {

            GitScopeUI.showToast(
                "Please enter a GitHub username.",
                "warning"
            );

            searchInput?.focus();

            return;
        }


        if (
            !isValidGitHubUsername(
                username
            )
        ) {

            GitScopeUI.showToast(
                "Please enter a valid GitHub username.",
                "warning"
            );

            searchInput?.focus();

            return;
        }


        await loadProfile(
            username
        );
    }


    /* =====================================================
       LOAD PROFILE
       ===================================================== */

    async function loadProfile(
        username
    ) {

        const normalized =
            normalizeUsername(
                username
            );


        if (
            !isValidGitHubUsername(
                normalized
            )
        ) {

            GitScopeUI.showToast(
                "Invalid GitHub username.",
                "warning"
            );

            return;
        }


        if (state.isLoading) {
            return;
        }


        state.isLoading = true;

        state.currentUsername =
            normalized;


        GitScopeUI.showLoading();


        try {

            console.log(
                `[GitScope] Fetching @${normalized}...`
            );


            const data =
                await GitHubAPI
                    .getCompleteProfile(
                        normalized
                    );


            state.currentData =
                data;


            /* Save search */

            GitScopeStorage.addSearch(
                normalized
            );

            GitScopeStorage.setLastUsername(
                normalized
            );


            /* Render */

            GitScopeUI.renderDashboard(
                data
            );


            GitScopeUI.renderHistory();


            /* Show history section */

            const historySection =
                document.querySelector(
                    "#history-section"
                );


            if (historySection) {

                historySection
                    .classList.remove("hidden");
            }


            /* Charts */

            const languages =
                calculateLanguages(
                    data.repositories
                );


            requestAnimationFrame(
                () => {

                    GitScopeCharts.renderAll({
                        ...data,
                        languages
                    });

                }
            );


            GitScopeUI.showToast(
                `@${normalized} analyzed successfully.`,
                "success"
            );


            console.log(
                "[GitScope] Profile loaded successfully."
            );


        } catch (error) {

            console.error(
                "[GitScope] Profile loading failed:",
                error
            );


            handleError(
                error
            );

        } finally {

            state.isLoading = false;

            GitScopeUI.hideLoading();
        }
    }


    /* =====================================================
       LANGUAGE DATA
       ===================================================== */

    function calculateLanguages(
        repositories
    ) {

        if (
            !Array.isArray(repositories)
        ) {

            return [];
        }


        const languageMap =
            new Map();


        repositories.forEach(
            repository => {

                const language =
                    repository?.language;


                if (!language) {
                    return;
                }


                languageMap.set(
                    language,
                    (
                        languageMap.get(language) || 0
                    ) + 1
                );
            }
        );


        return Array.from(
            languageMap.entries()
        )
        .map(
            ([name, count]) => ({
                name,
                count
            })
        )
        .sort(
            (a, b) =>
                b.count - a.count
        );
    }


    /* =====================================================
       ERROR
       ===================================================== */

    function handleError(
        error
    ) {

        let message =
            "Something went wrong while analyzing the profile.";


        if (
            error?.type === "NOT_FOUND"
        ) {

            message =
                "GitHub profile not found.";

        } else if (
            error?.type === "RATE_LIMIT"
        ) {

            message =
                "GitHub API rate limit reached. Please try again later.";

        } else if (
            error?.type === "NETWORK"
        ) {

            message =
                "Network error. Please check your internet connection.";

        } else if (
            error?.type === "TIMEOUT"
        ) {

            message =
                "The request timed out. Please try again.";

        } else if (
            error?.message
        ) {

            message =
                error.message;
        }


        GitScopeUI.showError(
            message
        );


        GitScopeUI.showToast(
            message,
            "error"
        );
    }


    /* =====================================================
       LAST USERNAME
       ===================================================== */

    function restoreLastUsername() {

        const username =
            GitScopeStorage
                .getLastUsername();


        if (
            username &&
            searchInput
        ) {

            searchInput.value =
                username;
        }
    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    return Object.freeze({

        init,

        handleSearch,

        loadProfile,

        getState() {

            return {
                ...state
            };
        }

    });

})();


/* =========================================================
   GLOBAL
   ========================================================= */

window.GitScopeApp =
    GitScopeApp;


/* =========================================================
   START
   ========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => GitScopeApp.init(),
        {
            once: true
        }
    );

} else {

    GitScopeApp.init();
}