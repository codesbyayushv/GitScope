/* =========================================================
   GitScope — Charts Engine
   Canvas-based analytics charts
   ========================================================= */

"use strict";


const GitScopeCharts = (() => {

    /* =====================================================
       STATE
       ===================================================== */

    const charts = new Map();


    /* =====================================================
       HELPERS
       ===================================================== */

    function getCanvas(selector) {

        if (!selector) {
            return null;
        }

        if (
            selector instanceof HTMLCanvasElement
        ) {
            return selector;
        }

        return document.querySelector(selector);
    }


    function getContext(canvas) {

        if (!canvas) {
            return null;
        }

        return canvas.getContext("2d");
    }


    function resizeCanvas(canvas) {

        if (!canvas) {
            return null;
        }

        const rect =
            canvas.getBoundingClientRect();

        const ratio =
            window.devicePixelRatio || 1;


        canvas.width =
            Math.max(
                1,
                Math.floor(rect.width * ratio)
            );

        canvas.height =
            Math.max(
                1,
                Math.floor(rect.height * ratio)
            );


        const context =
            canvas.getContext("2d");


        context.setTransform(
            ratio,
            0,
            0,
            ratio,
            0,
            0
        );


        return {
            width: rect.width,
            height: rect.height,
            ratio
        };
    }


    function clearCanvas(
        context,
        width,
        height
    ) {

        context.clearRect(
            0,
            0,
            width,
            height
        );
    }


    function roundedRect(
        context,
        x,
        y,
        width,
        height,
        radius
    ) {

        const r =
            Math.min(
                radius,
                width / 2,
                height / 2
            );


        context.beginPath();

        context.moveTo(
            x + r,
            y
        );

        context.lineTo(
            x + width - r,
            y
        );

        context.quadraticCurveTo(
            x + width,
            y,
            x + width,
            y + r
        );

        context.lineTo(
            x + width,
            y + height - r
        );

        context.quadraticCurveTo(
            x + width,
            y + height,
            x + width - r,
            y + height
        );

        context.lineTo(
            x + r,
            y + height
        );

        context.quadraticCurveTo(
            x,
            y + height,
            x,
            y + height - r
        );

        context.lineTo(
            x,
            y + r
        );

        context.quadraticCurveTo(
            x,
            y,
            x + r,
            y
        );

        context.closePath();
    }


    function getCSSVariable(
        name,
        fallback
    ) {

        const value =
            getComputedStyle(
                document.documentElement
            )
            .getPropertyValue(name)
            .trim();


        return value || fallback;
    }


    function getChartColors() {

        return {

            primary:
                getCSSVariable(
                    "--color-primary",
                    "#8b5cf6"
                ),

            secondary:
                getCSSVariable(
                    "--color-secondary",
                    "#06b6d4"
                ),

            text:
                getCSSVariable(
                    "--color-text-primary",
                    "#ffffff"
                ),

            muted:
                getCSSVariable(
                    "--color-text-muted",
                    "#8b8b9a"
                ),

            grid:
                getCSSVariable(
                    "--color-border",
                    "rgba(255,255,255,.08)"
                ),

            card:
                getCSSVariable(
                    "--color-surface",
                    "rgba(255,255,255,.04)"
                )
        };
    }


    function formatValue(
        value
    ) {

        if (
            typeof GitScopeUI !==
            "undefined" &&
            GitScopeUI.formatNumber
        ) {

            return GitScopeUI.formatNumber(
                value
            );
        }


        return String(
            Number(value) || 0
        );
    }


    /* =====================================================
       LANGUAGE BAR CHART
       ===================================================== */

    function drawLanguageChart(
        canvas,
        languages
    ) {

        canvas =
            getCanvas(canvas);


        const context =
            getContext(canvas);


        if (!canvas || !context) {
            return;
        }


        const size =
            resizeCanvas(canvas);


        if (!size) {
            return;
        }


        const {
            width,
            height
        } = size;


        clearCanvas(
            context,
            width,
            height
        );


        const colors =
            getChartColors();


        if (
            !Array.isArray(languages) ||
            languages.length === 0
        ) {

            context.fillStyle =
                colors.muted;

            context.font =
                "13px Inter, sans-serif";

            context.textAlign =
                "center";

            context.textBaseline =
                "middle";

            context.fillText(
                "No language data available",
                width / 2,
                height / 2
            );

            return;
        }


        const data =
            languages
                .slice(
                    0,
                    APP_CONFIG.CHARTS.MAX_LANGUAGES
                );


        const total =
            data.reduce(
                (sum, item) =>
                    sum +
                    Number(item.count || 0),
                0
            );


        if (total <= 0) {
            return;
        }


        const chartX = 20;
        const chartY = 20;

        const chartWidth =
            width - 40;

        const chartHeight =
            height - 40;


        const barHeight = 13;
        const gap = 22;


        data.forEach(
            (item, index) => {

                const count =
                    Number(item.count) || 0;


                const percentage =
                    (count / total) * 100;


                const y =
                    chartY +
                    index * gap;


                /* Label */

                context.fillStyle =
                    colors.text;

                context.font =
                    "600 12px Inter, sans-serif";

                context.textAlign =
                    "left";

                context.textBaseline =
                    "middle";


                context.fillText(
                    item.name,
                    chartX,
                    y
                );


                /* Percentage */

                context.fillStyle =
                    colors.muted;

                context.font =
                    "11px Inter, sans-serif";

                context.textAlign =
                    "right";


                context.fillText(
                    `${percentage.toFixed(0)}%`,
                    width - chartX,
                    y
                );


                /* Background */

                const barY =
                    y + 9;


                const barWidth =
                    chartWidth;


                context.fillStyle =
                    "rgba(255,255,255,.06)";


                roundedRect(
                    context,
                    chartX,
                    barY,
                    barWidth,
                    barHeight,
                    7
                );


                context.fill();


                /* Progress */

                const progressWidth =
                    Math.max(
                        4,
                        barWidth *
                        (percentage / 100)
                    );


                const gradient =
                    context.createLinearGradient(
                        chartX,
                        0,
                        chartX +
                        progressWidth,
                        0
                    );


                gradient.addColorStop(
                    0,
                    colors.primary
                );

                gradient.addColorStop(
                    1,
                    colors.secondary
                );


                context.fillStyle =
                    gradient;


                roundedRect(
                    context,
                    chartX,
                    barY,
                    progressWidth,
                    barHeight,
                    7
                );


                context.fill();
            }
        );


        charts.set(
            canvas,
            {
                type: "languages",
                data
            }
        );
    }


    /* =====================================================
       REPOSITORY STARS CHART
       ===================================================== */

    function drawRepositoryStarsChart(
        canvas,
        repositories
    ) {

        canvas =
            getCanvas(canvas);


        const context =
            getContext(canvas);


        if (!canvas || !context) {
            return;
        }


        const size =
            resizeCanvas(canvas);


        const {
            width,
            height
        } = size;


        clearCanvas(
            context,
            width,
            height
        );


        const colors =
            getChartColors();


        if (
            !Array.isArray(repositories) ||
            repositories.length === 0
        ) {

            drawEmptyState(
                context,
                width,
                height,
                colors
            );

            return;
        }


        const data =
            [...repositories]
                .sort(
                    (a, b) =>
                        (b.stargazers_count || 0) -
                        (a.stargazers_count || 0)
                )
                .slice(
                    0,
                    APP_CONFIG.CHARTS.MAX_REPOSITORIES
                );


        const maxValue =
            Math.max(
                ...data.map(
                    repository =>
                        Number(
                            repository.stargazers_count
                        ) || 0
                ),
                1
            );


        const padding = {
            top: 20,
            right: 18,
            bottom: 34,
            left: 42
        };


        const chartWidth =
            width -
            padding.left -
            padding.right;


        const chartHeight =
            height -
            padding.top -
            padding.bottom;


        /* Grid */

        const gridLines = 4;


        for (
            let i = 0;
            i <= gridLines;
            i++
        ) {

            const y =
                padding.top +
                chartHeight -
                (
                    chartHeight *
                    (i / gridLines)
                );


            context.beginPath();

            context.moveTo(
                padding.left,
                y
            );

            context.lineTo(
                width - padding.right,
                y
            );


            context.strokeStyle =
                colors.grid;

            context.lineWidth =
                1;

            context.stroke();


            context.fillStyle =
                colors.muted;

            context.font =
                "10px Inter, sans-serif";

            context.textAlign =
                "right";

            context.textBaseline =
                "middle";


            const value =
                Math.round(
                    maxValue *
                    (i / gridLines)
                );


            context.fillText(
                formatValue(value),
                padding.left - 8,
                y
            );
        }


        const barGap =
            Math.min(
                18,
                chartWidth /
                data.length * 0.22
            );


        const barWidth =
            (
                chartWidth -
                (
                    barGap *
                    (data.length + 1)
                )
            ) /
            data.length;


        data.forEach(
            (repository, index) => {

                const value =
                    Number(
                        repository.stargazers_count
                    ) || 0;


                const barHeight =
                    chartHeight *
                    (value / maxValue);


                const x =
                    padding.left +
                    barGap +
                    index *
                    (
                        barWidth +
                        barGap
                    );


                const y =
                    padding.top +
                    chartHeight -
                    barHeight;


                const gradient =
                    context.createLinearGradient(
                        0,
                        y,
                        0,
                        y + barHeight
                    );


                gradient.addColorStop(
                    0,
                    colors.secondary
                );

                gradient.addColorStop(
                    1,
                    colors.primary
                );


                context.fillStyle =
                    gradient;


                roundedRect(
                    context,
                    x,
                    y,
                    barWidth,
                    Math.max(
                        4,
                        barHeight
                    ),
                    7
                );


                context.fill();


                /* Value */

                context.fillStyle =
                    colors.text;

                context.font =
                    "600 10px Inter, sans-serif";

                context.textAlign =
                    "center";

                context.textBaseline =
                    "bottom";


                context.fillText(
                    formatValue(value),
                    x +
                    barWidth / 2,
                    y - 5
                );


                /* Repository name */

                context.save();

                context.translate(
                    x +
                    barWidth / 2,
                    height - 9
                );

                context.rotate(
                    -Math.PI / 8
                );


                context.fillStyle =
                    colors.muted;

                context.font =
                    "9px Inter, sans-serif";

                context.textAlign =
                    "right";

                context.textBaseline =
                    "middle";


                const name =
                    repository.name ||
                    "Repository";


                context.fillText(
                    truncate(
                        name,
                        16
                    ),
                    0,
                    0
                );


                context.restore();
            }
        );


        charts.set(
            canvas,
            {
                type: "repositories",
                data
            }
        );
    }


    /* =====================================================
       ACTIVITY CHART
       ===================================================== */

    function drawActivityChart(
        canvas,
        events
    ) {

        canvas =
            getCanvas(canvas);


        const context =
            getContext(canvas);


        if (!canvas || !context) {
            return;
        }


        const size =
            resizeCanvas(canvas);


        const {
            width,
            height
        } = size;


        clearCanvas(
            context,
            width,
            height
        );


        const colors =
            getChartColors();


        const activity =
            buildActivityData(
                events
            );


        if (
            activity.length === 0
        ) {

            drawEmptyState(
                context,
                width,
                height,
                colors
            );

            return;
        }


        const padding = {
            top: 20,
            right: 18,
            bottom: 28,
            left: 32
        };


        const chartWidth =
            width -
            padding.left -
            padding.right;


        const chartHeight =
            height -
            padding.top -
            padding.bottom;


        const maxValue =
            Math.max(
                ...activity.map(
                    item => item.count
                ),
                1
            );


        /* Horizontal grid */

        for (
            let i = 0;
            i <= 3;
            i++
        ) {

            const y =
                padding.top +
                chartHeight -
                (
                    chartHeight *
                    (i / 3)
                );


            context.beginPath();

            context.moveTo(
                padding.left,
                y
            );

            context.lineTo(
                width - padding.right,
                y
            );


            context.strokeStyle =
                colors.grid;

            context.lineWidth =
                1;

            context.stroke();
        }


        /* Points */

        const step =
            activity.length > 1
                ? chartWidth /
                  (activity.length - 1)
                : chartWidth;


        const points =
            activity.map(
                (item, index) => {

                    const x =
                        padding.left +
                        index * step;


                    const y =
                        padding.top +
                        chartHeight -
                        (
                            chartHeight *
                            (
                                item.count /
                                maxValue
                            )
                        );


                    return {
                        x,
                        y,
                        value: item.count
                    };
                }
            );


        /* Area */

        context.beginPath();

        context.moveTo(
            points[0].x,
            padding.top +
            chartHeight
        );


        points.forEach(
            point => {

                context.lineTo(
                    point.x,
                    point.y
                );
            }
        );


        context.lineTo(
            points[points.length - 1].x,
            padding.top +
            chartHeight
        );


        context.closePath();


        const areaGradient =
            context.createLinearGradient(
                0,
                padding.top,
                0,
                padding.top +
                chartHeight
            );


        areaGradient.addColorStop(
            0,
            "rgba(139,92,246,.24)"
        );

        areaGradient.addColorStop(
            1,
            "rgba(139,92,246,0)"
        );


        context.fillStyle =
            areaGradient;

        context.fill();


        /* Line */

        context.beginPath();


        points.forEach(
            (point, index) => {

                if (index === 0) {

                    context.moveTo(
                        point.x,
                        point.y
                    );

                } else {

                    context.lineTo(
                        point.x,
                        point.y
                    );
                }
            }
        );


        context.strokeStyle =
            colors.primary;

        context.lineWidth =
            2.5;

        context.lineJoin =
            "round";

        context.lineCap =
            "round";

        context.stroke();


        /* Points */

        points.forEach(
            point => {

                context.beginPath();

                context.arc(
                    point.x,
                    point.y,
                    3.5,
                    0,
                    Math.PI * 2
                );


                context.fillStyle =
                    colors.secondary;

                context.fill();


                context.beginPath();

                context.arc(
                    point.x,
                    point.y,
                    1.5,
                    0,
                    Math.PI * 2
                );


                context.fillStyle =
                    colors.text;

                context.fill();
            }
        );


        /* Labels */

        points.forEach(
            (point, index) => {

                if (
                    index % 2 !== 0 &&
                    activity.length > 7
                ) {
                    return;
                }


                context.fillStyle =
                    colors.muted;

                context.font =
                    "9px Inter, sans-serif";

                context.textAlign =
                    "center";

                context.textBaseline =
                    "top";


                context.fillText(
                    activity[index].label,
                    point.x,
                    height - 17
                );
            }
        );


        charts.set(
            canvas,
            {
                type: "activity",
                data: activity
            }
        );
    }


    /* =====================================================
       ACTIVITY DATA
       ===================================================== */

    function buildActivityData(
        events
    ) {

        if (
            !Array.isArray(events) ||
            events.length === 0
        ) {

            return [];
        }


        const buckets =
            new Map();


        events.forEach(
            event => {

                if (!event.created_at) {
                    return;
                }


                const date =
                    new Date(
                        event.created_at
                    );


                if (
                    Number.isNaN(
                        date.getTime()
                    )
                ) {
                    return;
                }


                const key =
                    date.toISOString()
                        .slice(0, 10);


                buckets.set(
                    key,
                    (
                        buckets.get(key) || 0
                    ) + 1
                );
            }
        );


        return Array.from(
            buckets.entries()
        )
        .sort(
            ([a], [b]) =>
                a.localeCompare(b)
        )
        .slice(
            -APP_CONFIG.CHARTS.MAX_ACTIVITY_POINTS
        )
        .map(
            ([date, count]) => {

                const parsed =
                    new Date(date);


                return {

                    date,

                    count,

                    label:
                        parsed.toLocaleDateString(
                            "en-IN",
                            {
                                day: "numeric",
                                month: "short"
                            }
                        )
                };
            }
        );
    }


    /* =====================================================
       EMPTY CHART
       ===================================================== */

    function drawEmptyState(
        context,
        width,
        height,
        colors
    ) {

        context.fillStyle =
            colors.muted;

        context.font =
            "13px Inter, sans-serif";

        context.textAlign =
            "center";

        context.textBaseline =
            "middle";


        context.fillText(
            "Not enough data for this chart",
            width / 2,
            height / 2
        );
    }


    /* =====================================================
       STRING TRUNCATION
       ===================================================== */

    function truncate(
        value,
        length
    ) {

        if (
            typeof value !== "string"
        ) {

            return "";
        }


        if (
            value.length <= length
        ) {

            return value;
        }


        return (
            value.slice(
                0,
                length - 1
            ) + "…"
        );
    }


    /* =====================================================
       INITIALIZE ALL CHARTS
       ===================================================== */

    function renderAll(
        data
    ) {

        if (!data) {
            return;
        }


        const languages =
            Array.isArray(
                data.languages
            )
                ? data.languages
                : [];


        const repositories =
            Array.isArray(
                data.repositories
            )
                ? data.repositories
                : [];


        const events =
            Array.isArray(
                data.events
            )
                ? data.events
                : [];


        const languageCanvas =
            document.querySelector(
                "#languageChart"
            );


        const starsCanvas =
            document.querySelector(
                "#starsChart"
            );


        const activityCanvas =
            document.querySelector(
                "#activityChart"
            );


        if (languageCanvas) {

            drawLanguageChart(
                languageCanvas,
                languages
            );
        }


        if (starsCanvas) {

            drawRepositoryStarsChart(
                starsCanvas,
                repositories
            );
        }


        if (activityCanvas) {

            drawActivityChart(
                activityCanvas,
                events
            );
        }
    }


    /* =====================================================
       REDRAW
       ===================================================== */

    function redraw() {

        charts.forEach(
            (chart, canvas) => {

                if (
                    !canvas ||
                    !document.body.contains(canvas)
                ) {

                    return;
                }


                if (
                    chart.type ===
                    "languages"
                ) {

                    drawLanguageChart(
                        canvas,
                        chart.data
                    );

                } else if (
                    chart.type ===
                    "repositories"
                ) {

                    drawRepositoryStarsChart(
                        canvas,
                        chart.data
                    );

                } else if (
                    chart.type ===
                    "activity"
                ) {

                    drawActivityChart(
                        canvas,
                        chart.data
                    );
                }
            }
        );
    }


    /* =====================================================
       RESIZE HANDLER
       ===================================================== */

    let resizeTimer = null;


    window.addEventListener(
        "resize",
        () => {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    redraw,
                    180
                );
        }
    );


    /* =====================================================
       PUBLIC API
       ===================================================== */

    return Object.freeze({

        drawLanguageChart,

        drawRepositoryStarsChart,

        drawActivityChart,

        buildActivityData,

        renderAll,

        redraw

    });

})();


/* =========================================================
   GLOBAL EXPORT
   ========================================================= */

window.GitScopeCharts =
    GitScopeCharts;


/* =========================================================
   DEVELOPMENT CHECK
   ========================================================= */

console.log(
    "[GitScope] Charts engine loaded."
);