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
            progress = progress >= 100 ? 95 : progress;
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

    function createTSV(table, index) {
        const data = table.rows;
        const start = index === 0 ? 0 : 1; // skip header row after first table
        let status;
        let content = "";
        let row;
        let formatted_row;
        const formatter = (item, index, arr) => {
            let text = item.trim();

            if (index === 2 && arr.length === 9) {
                // name column is empty for guaranteed loans
                text += "\t";
            }

            return text;
        };

        for (let i = start; i < data.length; i++) {
            status = data[i].innerHTML.match(/green|yellow|red|blue/);
            status = status ? statuses[language][status[0]] : statuses[language].status;
            row = data[i].textContent.split("\n");
            row = row.filter(row => row.match(/\S/));
            formatted_row = `${status}\t${row.map(formatter).join("\t")}\n`;

            content += formatted_row;
        }

        return content;
    }

    function handleData(data) {
        const dlLink = document.createElement("a");
        let tsvContent = "data:text/tab-separated-values;charset=utf-8,";
        let range;
        let documentFragment;
        let investmentsTable;

        for (let i = 0; i < data.length; i++) {
            range = document.createRange();
            documentFragment = range.createContextualFragment(data[i]);
            investmentsTable = documentFragment.querySelector("table.uk-table");
            tsvContent += createTSV(investmentsTable, i);
        }

        dlLink.setAttribute("href", encodeURI(tsvContent));
        dlLink.setAttribute("download", "OR_investments.tsv");
        dlLink.textContent = dlLinkNames[language];
        linkAndButtonParent.appendChild(dlLink);
    }

    const linkAndButtonParent = document.getElementsByClassName("uk-clearfix")[1];
    const language = document.querySelector("a.js-lang").firstChild.textContent.trim(); // EST, ENG or RUS
    const statuses = {
        EST: { green: "Roheline", yellow: "Kollane", red: "Punane", blue: "Sinine", status: "Staatus" },
        ENG: { green: "Green", yellow: "Yellow", red: "Red", blue: "Blue", status: "Status" },
        RUS: { green: "зеленый", yellow: "желтый", red: "красный", blue: "синий", status: "статус" }
    };
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
    generateDataButton.setAttribute("class", "uk-button uk-button-primary uk-align-right");

    // prevents adding the button again when reloading the extension
    if (linkAndButtonParent.childElementCount < 3) {
        linkAndButtonParent.appendChild(generateDataButton);
    }

    // main
    generateDataButton.addEventListener("click", async () => {
        generateDataButton.disabled = true;

        const data = await fetchData();
        handleData(data);
    });
})();
