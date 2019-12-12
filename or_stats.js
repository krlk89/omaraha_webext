"use strict";

(async () => {
    function filterDataForTSV(table) {
        const data = table.innerText.split("\n");

        // remove rows with no data
        return data.filter(row => row.match(/\S/));
    }

    function createTSV(filteredStats, filteredHeadings) {
        let tsvContent = "data:text/tab-separated-values;charset=utf-8,";

        // add empty elements to align rows
        filteredHeadings.splice(0, 0, "");
        if (filteredStats.length === 15) {
            // incomplete stats (e.g. stats for current year + n)
            filteredStats.splice(4, 0, "", "", "");
        }
        else {
            filteredStats.splice(19, 0, "");
        }

        // max length for headings and stats array is 26
        for (let i = 0; i < 27; i++) {
            if (filteredStats[i]) {
                tsvContent += `${filteredHeadings[i]}\t${filteredStats[i]}\n`;
            }
            else {
                // incomplete stats
                tsvContent += `${filteredHeadings[i]}\n`;
            }
        }

        return tsvContent;
    }

    const headingsTable = document.getElementById("freeze");
    const statsTable = document.getElementById("my_stats");
    const filteredHeadings = filterDataForTSV(headingsTable);
    const filteredStats = filterDataForTSV(statsTable);
    const language = await lang || "ENG"; // EST, ENG or RUS
    const year = document.querySelector("ul.uk-subnav.uk-subnav-pill.uk-text-bold.stats-footer li.uk-active").textContent.trim();
    const dlLinkParentDiv = document.querySelector("div.uk-form-row.uk-margin-top.uk-text-right.uk-margin-large-right");
    const tsvContent = createTSV(filteredStats, filteredHeadings);
    const dlLink = document.createElement("a");
    dlLink.setAttribute("href", encodeURI(tsvContent));
    dlLink.setAttribute("download", `OR_stats_${year}.tsv`);
    dlLink.textContent = dlLinkNames[language];

    // prevents adding the dlLink again when reloading the extension
    if (dlLinkParentDiv.childElementCount < 2) {
        dlLinkParentDiv.appendChild(dlLink);
    }
})();
