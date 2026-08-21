/* =========================================================
   GitScope — UI Controller
   Handles DOM rendering and interface state
   ========================================================= */

"use strict";


/* =========================================================
   UI SERVICE
   ========================================================= */

const GitScopeUI = (() => {

    /* =====================================================
       DOM CACHE
       ===================================================== */

    const elements = {};

    let cached = false;


    function cacheElements() {

        if (cached) {
            return elements;
        }

        /* Search */
        elements.searchInput =
            document.querySelector("#username-input");

        elements.analyzeButton =
            document.querySelector("#analyze-button");


        /* Sections */
        elements.dashboard =
            document.querySelector("#dashboard");

        elements.loadingSection =
            document.querySelector("#loading-section");

        elements.errorSection =
            document.querySelector("#error-section");

        elements.errorMessage =
            document.querySelector("#error-message");

        elements.retryButton =
            document.querySelector("#retry-button");


        /* Profile */
        elements.profileAvatar =
            document.querySelector("#profile-avatar");

        elements.profileName =
            document.querySelector("#profile-name");

        elements.profileUsername =
            document.querySelector("#profile-username");

        elements.profileBio =
            document.querySelector("#profile-bio");

        elements.profileLink =
            document.querySelector("#profile-link");

        elements.profileLocation =
            document.querySelector("#profile-location");

        elements.profileCompany =
            document.querySelector("#profile-company");

        elements.profileBlog =
            document.querySelector("#profile-blog");

        elements.profileJoined =
            document.querySelector("#profile-joined");


        /* Stats */
        elements.statRepositories =
            document.querySelector("#stat-repositories");

        elements.statFollowers =
            document.querySelector("#stat-followers");

        elements.statFollowing =
            document.querySelector("#stat-following");

        elements.statStars =
            document.querySelector("#stat-stars");

        elements.statForks =
            document.querySelector("#stat-forks");


        /* Languages */
        elements.languageList =
            document.querySelector("#language-list");

        elements.languageEmpty =
            document.querySelector("#language-empty");


        /* Insights */
        elements.mostStarredRepo =
            document.querySelector("#most-starred-repo");

        elements.mostForkedRepo =
            document.querySelector("#most-forked-repo");

        elements.topLanguage =
            document.querySelector("#top-language");

        elements.latestUpdate =
            document.querySelector("#latest-update");


        /* Repositories */
        elements.repositoriesGrid =
            document.querySelector("#repositories-grid");

        elements.repositoriesEmpty =
            document.querySelector("#repositories-empty");


        /* History */
        elements.historySection =
            document.querySelector("#history-section");

        elements.historyList =
            document.querySelector("#history-list");

        elements.clearHistory =
            document.querySelector("#clear-history");


        /* Toast */
        elements.toast =
            document.querySelector("#toast");

        elements.toastMessage =
            document.querySelector("#toast-message");


        cached = true;

        return elements;
    }


    /* =====================================================
       SAFE DOM HELPERS
       ===================================================== */

    function setText(
        element,
        value,
        fallback = "—"
    ) {

        if (!element) {
            return;
        }

        element.textContent =
            value === null ||
            value === undefined ||
            value === ""
                ? fallback
                : value;
    }


    function setAttribute(
        element,
        attribute,
        value
    ) {

        if (!element) {
            return;
        }

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            element.removeAttribute(attribute);

            return;
        }

        element.setAttribute(
            attribute,
            value
        );
    }


    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       FORMATTERS
       ===================================================== */

    function formatNumber(value) {

        const number =
            Number(value);

        if (!Number.isFinite(number)) {
            return "0";
        }

        return new Intl.NumberFormat(
            "en-US",
            {
                notation:
                    number >= 1000
                        ? "compact"
                        : "standard",

                maximumFractionDigits: 1
            }
        ).format(number);
    }


    function formatDate(date) {

        if (!date) {
            return "—";
        }

        const parsed =
            new Date(date);

        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {
            return "—";
        }

        return new Intl.DateTimeFormat(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        ).format(parsed);
    }


    function formatRelativeDate(date) {

        if (!date) {
            return "Unknown";
        }

        const parsed =
            new Date(date);

        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {
            return "Unknown";
        }

        const diff =
            Date.now() -
            parsed.getTime();

        const minutes =
            Math.floor(
                diff / 60000
            );

        if (minutes < 1) {
            return "Just now";
        }

        if (minutes < 60) {
            return `${minutes}m ago`;
        }

        const hours =
            Math.floor(
                minutes / 60
            );

        if (hours < 24) {
            return `${hours}h ago`;
        }

        const days =
            Math.floor(
                hours / 24
            );

        if (days < 30) {
            return `${days}d ago`;
        }

        const months =
            Math.floor(
                days / 30
            );

        if (months < 12) {
            return `${months}mo ago`;
        }

        const years =
            Math.floor(
                months / 12
            );

        return `${years}y ago`;
    }


    function formatUrl(url) {

        if (!url) {
            return "";
        }

        return String(url)
            .replace(/^https?:\/\//, "")
            .replace(/\/$/, "");
    }


    /* =====================================================
       APP STATES
       ===================================================== */

    function showDashboard() {

        cacheElements();

        elements.loadingSection
            ?.classList.add("hidden");

        elements.errorSection
            ?.classList.add("hidden");

        elements.dashboard
            ?.classList.remove("hidden");
    }


    function showLoading() {

        cacheElements();

        elements.dashboard
            ?.classList.add("hidden");

        elements.errorSection
            ?.classList.add("hidden");

        elements.loadingSection
            ?.classList.remove("hidden");

        if (elements.analyzeButton) {
            elements.analyzeButton.disabled = true;
        }
    }


    function hideLoading() {

        cacheElements();

        elements.loadingSection
            ?.classList.add("hidden");

        if (elements.analyzeButton) {
            elements.analyzeButton.disabled = false;
        }
    }


    function showError(message) {

        cacheElements();

        elements.dashboard
            ?.classList.add("hidden");

        elements.loadingSection
            ?.classList.add("hidden");

        elements.errorSection
            ?.classList.remove("hidden");

        setText(
            elements.errorMessage,
            message,
            APP_CONFIG.ERRORS.UNKNOWN
        );

        if (elements.analyzeButton) {
            elements.analyzeButton.disabled = false;
        }
    }


    function hideError() {

        cacheElements();

        elements.errorSection
            ?.classList.add("hidden");
    }


    /* =====================================================
       CLEAR OLD DASHBOARD
       ===================================================== */

    function clearDashboard() {

        cacheElements();

        /* Profile */
        setAttribute(
            elements.profileAvatar,
            "src",
            ""
        );

        setText(
            elements.profileName,
            "GitHub User"
        );

        setText(
            elements.profileUsername,
            "@username"
        );

        setText(
            elements.profileBio,
            "GitHub developer"
        );


        /* Profile link */
        setAttribute(
            elements.profileLink,
            "href",
            "#"
        );


        /* Stats */
        setText(
            elements.statRepositories,
            "0"
        );

        setText(
            elements.statFollowers,
            "0"
        );

        setText(
            elements.statFollowing,
            "0"
        );

        setText(
            elements.statStars,
            "0"
        );

        setText(
            elements.statForks,
            "0"
        );


        /* Repositories */
        if (elements.repositoriesGrid) {
            elements.repositoriesGrid.innerHTML = "";
        }


        /* Languages */
        if (elements.languageList) {
            elements.languageList.innerHTML = "";
        }


        /* Insights */
        setText(
            elements.mostStarredRepo,
            "—"
        );

        setText(
            elements.mostForkedRepo,
            "—"
        );

        setText(
            elements.topLanguage,
            "—"
        );

        setText(
            elements.latestUpdate,
            "—"
        );
    }


    /* =====================================================
       PROFILE
       ===================================================== */

    function renderProfile(user) {

        cacheElements();

        if (!user) {
            return;
        }


        /* Avatar */

        setAttribute(
            elements.profileAvatar,
            "src",
            user.avatar_url
        );

        setAttribute(
            elements.profileAvatar,
            "alt",
            `${user.login || "GitHub"} avatar`
        );


        /* Name */

        setText(
            elements.profileName,
            user.name ||
            user.login ||
            "GitHub User"
        );


        /* Username */

        setText(
            elements.profileUsername,
            user.login
                ? `@${user.login}`
                : "Unknown user"
        );


        /* Bio */

        setText(
            elements.profileBio,
            user.bio ||
            "No bio available."
        );


        /* Profile URL */

        setAttribute(
            elements.profileLink,
            "href",
            user.html_url || "#"
        );


        /* Location */

        if (elements.profileLocation) {

            const value =
                elements.profileLocation
                    .querySelector(".meta-value");

            setText(
                value,
                user.location ||
                "Location not available"
            );

            elements.profileLocation
                .classList.toggle(
                    "hidden",
                    !user.location
                );
        }


        /* Company */

        if (elements.profileCompany) {

            const value =
                elements.profileCompany
                    .querySelector(".meta-value");

            setText(
                value,
                user.company ||
                "No company listed"
            );

            elements.profileCompany
                .classList.toggle(
                    "hidden",
                    !user.company
                );
        }


        /* Blog */

        if (elements.profileBlog) {

            const value =
                elements.profileBlog
                    .querySelector(".meta-value");

            if (user.blog) {

                setText(
                    value,
                    formatUrl(user.blog)
                );

                let blogUrl =
                    user.blog;

                if (
                    !/^https?:\/\//i.test(blogUrl)
                ) {
                    blogUrl =
                        `https://${blogUrl}`;
                }

                setAttribute(
                    elements.profileBlog,
                    "data-url",
                    blogUrl
                );

                elements.profileBlog
                    .classList.remove("hidden");

            } else {

                setText(
                    value,
                    ""
                );

                setAttribute(
                    elements.profileBlog,
                    "data-url",
                    null
                );

                elements.profileBlog
                    .classList.add("hidden");
            }
        }


        /* Joined */

        if (elements.profileJoined) {

            const value =
                elements.profileJoined
                    .querySelector(".meta-value");

            setText(
                value,
                user.created_at
                    ? formatDate(user.created_at)
                    : "—"
            );
        }
    }


    /* =====================================================
       PROFILE STATS
       ===================================================== */

    function calculateRepositoryStats(
        repositories
    ) {

        if (
            !Array.isArray(repositories)
        ) {

            return {
                stars: 0,
                forks: 0
            };
        }


        return repositories.reduce(
            (total, repository) => {

                total.stars +=
                    Number(
                        repository.stargazers_count
                    ) || 0;

                total.forks +=
                    Number(
                        repository.forks_count
                    ) || 0;

                return total;

            },
            {
                stars: 0,
                forks: 0
            }
        );
    }


    function renderStats(
        user,
        repositories
    ) {

        cacheElements();

        const stats =
            calculateRepositoryStats(
                repositories
            );


        setText(
            elements.statRepositories,
            formatNumber(
                user?.public_repos || 0
            )
        );


        setText(
            elements.statFollowers,
            formatNumber(
                user?.followers || 0
            )
        );


        setText(
            elements.statFollowing,
            formatNumber(
                user?.following || 0
            )
        );


        setText(
            elements.statStars,
            formatNumber(
                stats.stars
            )
        );


        setText(
            elements.statForks,
            formatNumber(
                stats.forks
            )
        );


        return stats;
    }


    /* =====================================================
       REPOSITORIES
       ===================================================== */

    function renderRepositories(
        repositories
    ) {

        cacheElements();

        if (
            !elements.repositoriesGrid
        ) {
            return;
        }


        /* IMPORTANT:
           Always remove previous user's repositories.
        */

        elements.repositoriesGrid.innerHTML = "";


        if (
            !Array.isArray(repositories) ||
            repositories.length === 0
        ) {

            if (elements.repositoriesEmpty) {
                elements.repositoriesEmpty
                    .classList.remove("hidden");
            }

            return;
        }


        if (elements.repositoriesEmpty) {
            elements.repositoriesEmpty
                .classList.add("hidden");
        }


        const limit =
            APP_CONFIG.UI.REPOSITORIES_PER_PAGE;


        const visibleRepositories =
            repositories.slice(
                0,
                limit
            );


        visibleRepositories.forEach(
            repository => {

                const card =
                    createRepositoryCard(
                        repository
                    );

                elements.repositoriesGrid
                    .appendChild(card);
            }
        );
    }


    function createRepositoryCard(
        repository
    ) {

        const article =
            document.createElement("article");

        article.className =
            "repository-card";


        const language =
            repository.language ||
            "Unknown";


        const description =
            repository.description ||
            "No description available.";


        const stars =
            Number(
                repository.stargazers_count
            ) || 0;


        const forks =
            Number(
                repository.forks_count
            ) || 0;


        article.innerHTML = `

            <div class="repository-top">

                <a
                    class="repository-name"
                    href="${escapeHTML(
                        repository.html_url || "#"
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="${escapeHTML(
                        repository.name || ""
                    )}"
                >
                    ${escapeHTML(
                        repository.name ||
                        "Unnamed repository"
                    )}
                </a>

                <span
                    class="repository-icon"
                    aria-hidden="true"
                >
                    ◈
                </span>

            </div>


            <p class="repository-description">
                ${escapeHTML(description)}
            </p>


            <div class="repository-bottom">

                <span class="repository-language">

                    <span
                        class="repository-language-dot"
                    ></span>

                    ${escapeHTML(language)}

                </span>


                <span class="repository-stat">

                    <span class="repository-stat-icon">
                        ★
                    </span>

                    ${formatNumber(stars)}

                </span>


                <span class="repository-stat">

                    <span class="repository-stat-icon">
                        ⑂
                    </span>

                    ${formatNumber(forks)}

                </span>


                <span class="repository-updated">
                    ${formatRelativeDate(
                        repository.updated_at
                    )}
                </span>

            </div>

        `;


        return article;
    }


    /* =====================================================
       LANGUAGES
       ===================================================== */

    function calculateLanguages(
        repositories
    ) {

        const languages =
            new Map();


        if (
            !Array.isArray(repositories)
        ) {
            return [];
        }


        repositories.forEach(
            repository => {

                const language =
                    repository?.language;


                if (!language) {
                    return;
                }


                languages.set(
                    language,
                    (
                        languages.get(language) ||
                        0
                    ) + 1
                );
            }
        );


        return Array.from(
            languages.entries()
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


    function getLanguageColor(
        language
    ) {

        const colors = {

            JavaScript: "#f7df1e",

            TypeScript: "#3178c6",

            Python: "#3776ab",

            Java: "#f89820",

            "C++": "#00599c",

            C: "#555555",

            "C#": "#68217a",

            PHP: "#777bb4",

            HTML: "#e34f26",

            CSS: "#1572b6",

            Go: "#00add8",

            Rust: "#dea584",

            Ruby: "#cc342d",

            Swift: "#f05138",

            Kotlin: "#7f52ff",

            Dart: "#0175c2",

            Shell: "#89e051"
        };


        return (
            colors[language] ||
            "#8b5cf6"
        );
    }


    function renderLanguages(
        repositories
    ) {

        cacheElements();

        if (
            !elements.languageList
        ) {
            return;
        }


        elements.languageList.innerHTML =
            "";


        const languages =
            calculateLanguages(
                repositories
            )
            .slice(
                0,
                APP_CONFIG.CHARTS.MAX_LANGUAGES
            );


        if (
            languages.length === 0
        ) {

            elements.languageList.innerHTML = `
                <span class="language-item">
                    No language data
                </span>
            `;

            elements.languageEmpty
                ?.classList.remove("hidden");

            return;
        }


        elements.languageEmpty
            ?.classList.add("hidden");


        languages.forEach(
            language => {

                const color =
                    getLanguageColor(
                        language.name
                    );


                const item =
                    document.createElement("span");


                item.className =
                    "language-item";


                item.innerHTML = `

                    <span
                        class="language-dot"
                        style="--language-color: ${color};"
                    ></span>

                    ${escapeHTML(
                        language.name
                    )}

                    <span>
                        ${language.count}
                    </span>
                `;


                elements.languageList
                    .appendChild(item);
            }
        );
    }


    /* =====================================================
       INSIGHTS
       ===================================================== */

    function renderInsights(
        user,
        repositories
    ) {

        cacheElements();


        const repoList =
            Array.isArray(repositories)
                ? repositories
                : [];


        /* Most starred */

        const mostStarred =
            repoList.length
                ? [...repoList].sort(
                    (a, b) =>
                        (
                            Number(
                                b.stargazers_count
                            ) || 0
                        ) -
                        (
                            Number(
                                a.stargazers_count
                            ) || 0
                        )
                )[0]
                : null;


        /* Most forked */

        const mostForked =
            repoList.length
                ? [...repoList].sort(
                    (a, b) =>
                        (
                            Number(
                                b.forks_count
                            ) || 0
                        ) -
                        (
                            Number(
                                a.forks_count
                            ) || 0
                        )
                )[0]
                : null;


        /* Languages */

        const languages =
            calculateLanguages(
                repoList
            );


        const topLanguage =
            languages.length
                ? languages[0].name
                : "Not available";


        /* Latest update */

        const latestRepository =
            repoList.length
                ? [...repoList].sort(
                    (a, b) =>
                        new Date(
                            b.updated_at || 0
                        ) -
                        new Date(
                            a.updated_at || 0
                        )
                )[0]
                : null;


        setText(
            elements.mostStarredRepo,
            mostStarred?.name ||
            "None"
        );


        setText(
            elements.mostForkedRepo,
            mostForked?.name ||
            "None"
        );


        setText(
            elements.topLanguage,
            topLanguage
        );


        setText(
            elements.latestUpdate,
            latestRepository
                ? formatRelativeDate(
                    latestRepository.updated_at
                )
                : "Not available"
        );
    }


    /* =====================================================
       SEARCH HISTORY
       ===================================================== */

    function renderHistory() {

        cacheElements();


        if (
            !elements.historyList
        ) {
            return;
        }


        const history =
            GitScopeStorage
                .getSearchHistory();


        elements.historyList.innerHTML =
            "";


        if (
            !history ||
            history.length === 0
        ) {

            elements.historySection
                ?.classList.add("hidden");

            return;
        }


        elements.historySection
            ?.classList.remove("hidden");


        history.forEach(
            username => {

                const item =
                    document.createElement("button");


                item.type =
                    "button";


                item.className =
                    "history-item";


                item.dataset.username =
                    username;


                item.innerHTML = `

                    <span class="history-icon">
                        ◌
                    </span>

                    <span>
                        ${escapeHTML(username)}
                    </span>
                `;


                item.addEventListener(
                    "click",
                    () => {

                        if (
                            elements.searchInput
                        ) {

                            elements.searchInput.value =
                                username;
                        }


                        if (
                            elements.analyzeButton
                        ) {

                            elements.analyzeButton.click();
                        }
                    }
                );


                elements.historyList
                    .appendChild(item);
            }
        );
    }


    /* =====================================================
       TOAST
       ===================================================== */

    let toastTimer = null;


    function showToast(
        message,
        type = "success"
    ) {

        cacheElements();


        if (
            !elements.toast
        ) {
            return;
        }


        clearTimeout(
            toastTimer
        );


        setText(
            elements.toastMessage,
            message
        );


        const icon =
            elements.toast.querySelector(
                ".toast-icon"
            );


        if (icon) {

            icon.textContent =
                type === "error"
                    ? "!"
                    : type === "warning"
                        ? "!"
                        : "✓";
        }


        elements.toast
            .classList.add("show");


        toastTimer =
            setTimeout(
                () => {

                    elements.toast
                        ?.classList.remove("show");

                },
                APP_CONFIG.UI.TOAST_DURATION
            );
    }


    /* =====================================================
       COMPLETE DASHBOARD
       ===================================================== */

    function renderDashboard(
        data
    ) {

        if (
            !data ||
            !data.user
        ) {
            return;
        }


        cacheElements();


        /*
         * IMPORTANT:
         * Clear previous user's data first.
         */

        clearDashboard();


        const user =
            data.user;


        const repositories =
            Array.isArray(
                data.repositories
            )
                ? data.repositories
                : [];


        /* Render new profile */

        renderProfile(
            user
        );


        /* Render stats */

        renderStats(
            user,
            repositories
        );


        /* Render repositories */

        renderRepositories(
            repositories
        );


        /* Render languages */

        renderLanguages(
            repositories
        );


        /* Render insights */

        renderInsights(
            user,
            repositories
        );


        /* Show dashboard */

        showDashboard();
    }


    /* =====================================================
       RESET DASHBOARD
       ===================================================== */

    function resetDashboard() {

        cacheElements();

        clearDashboard();

        elements.dashboard
            ?.classList.add("hidden");

        elements.errorSection
            ?.classList.add("hidden");
    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    return Object.freeze({

        cacheElements,

        showDashboard,

        showLoading,

        hideLoading,

        showError,

        hideError,

        resetDashboard,

        clearDashboard,

        renderProfile,

        renderStats,

        renderRepositories,

        renderLanguages,

        renderInsights,

        renderHistory,

        renderDashboard,

        showToast,

        formatNumber,

        formatDate,

        formatRelativeDate

    });

})();


/* =========================================================
   GLOBAL EXPORT
   ========================================================= */

window.GitScopeUI =
    GitScopeUI;


/* =========================================================
   DEVELOPMENT CHECK
   ========================================================= */

console.log(
    "[GitScope] UI controller loaded."
);