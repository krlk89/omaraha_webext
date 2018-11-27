"use strict";

(() => {
    function wait(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    async function fetchData() {
        const urlData = window.location;
        let searchStr = urlData.search ? urlData.search : "";
        searchStr = searchStr.replace(/\?(page=\d+&)?/, "");
        const pages = document.querySelectorAll("ul.uk-pagination > li.uk-text-bold");
        const pageCount = pages.length > 0 ? parseInt(pages[pages.length - 1].textContent) : 1;
        const dataArray = [];
        let progress = 0;
        let promise;
        let response;
        let data;

        for (let i = 1; i <= pageCount; i++) {
            progress += Math.ceil(100 / pageCount);
            if (progress >= 100) {
                progress = 95;
            }
            generateDataButton.textContent = `${progress}%`;
            promise = fetch(`${urlData.origin}${urlData.pathname}?page=${i}&${searchStr}`);
            response = await promise;
            data = await response.text();
            dataArray.push(data);

            await wait(2000);
        }
        generateDataButton.textContent = generateDataButtonNames[language][1];

        return dataArray;
    }

    function createTSV(table, index, tableCount) {
        const data = table.rows;
        const start = index === 0 ? 0 : 1; // skip header row after first table
        const end = index === tableCount ? data.length : data.length - 1; // skip footer row before last table
        let content = "";
        let row;
        let formatted_row;
        const formatter = (item, index, arr) => {
            let text = item.trim();

            if (text.endsWith("/")) {
                // do not split loan agreement names to 2 columns
                text += " ";
            }
            else if (arr.length === 4 && index === 1) {
                // row without loan agreement names
                text += "\t\t";
            }
            else if (arr.length === 2 && index === 0) {
                // account balance row (last)
                text += "\t\t\t\t";
            }
            else if (index === arr.length - 1) {
                // end of row
                text += "\n";
            }
            else {
                text += "\t";
            }

            return text;
        }

        for (let i = start; i < end; i++) {
            row = data[i].textContent.split("\n");
            row = row.filter(row => row.match(/\S/));
            formatted_row = row.map(formatter).join("");

            content += formatted_row;
        }

        return content;
    }

    function handleData(data) {
        const dlLink = document.createElement("a");
        let tsvContent = "data:text/tab-separated-values;charset=utf-8,";
        let range;
        let documentFragment;
        let historyTable;

        for (let i = 0; i < data.length; i++) {
            range = document.createRange();
            documentFragment = range.createContextualFragment(data[i]);
            historyTable = documentFragment.getElementById("history");

            tsvContent += createTSV(historyTable, i, data.length - 1);
        }

        dlLink.setAttribute("href", encodeURI(tsvContent));
        dlLink.setAttribute("download", "OR_balance.tsv");
        dlLink.textContent = dlLinkNames[language];
        linkAndButtonParent.appendChild(dlLink);
    }


    const linkAndButtonParent = document.getElementById("filter");
    const language = document.querySelector("a.js-lang").firstChild.textContent.trim(); // EST, ENG or RUS
    const generateDataButtonNames = {
        EST: ["Koosta .tsv", "Fail valmis"],
        ENG: ["Generate .tsv", "File ready"],
        RUS: ["генерировать .tsv", "файл готов"]
    };
    const dlLinkNames = {
        EST: "Lae alla .tsv",
        ENG: "Download .tsv",
        RUS: "скачать .tsv"
    };
    const generateDataButton = document.createElement("button");
    generateDataButton.textContent = generateDataButtonNames[language][0];
    generateDataButton.setAttribute("class", "uk-button uk-button-primary uk-button-arrow-left uk-float-right");

    // prevents adding the button again when reloading the extension
    if (linkAndButtonParent.childElementCount < 2) {
        linkAndButtonParent.appendChild(generateDataButton);
    }

    // build tsv
    generateDataButton.addEventListener("click", async () => {
        generateDataButton.disabled = true;

        const data = await fetchData();
        handleData(data);
    });
})();
