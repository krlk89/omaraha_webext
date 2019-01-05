"use strict";

(async () => {
    function createTSV(table, index, tableCount) {
        const data = table.rows;
        const start = index === 0 ? 0 : 1; // skip header row after first table
        const end = index === tableCount ? data.length : data.length - 1; // skip footer row before last table
        let content = "";
        let row;
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
            else {
                text += "\t";
            }

            return text;
        };

        for (let i = start; i < end; i++) {
            row = data[i].textContent.split("\n");
            row = row.filter(row => row.match(/\S/));

            content += `${row.map(formatter).join("")}\n`;
        }

        return content;
    }

    const language = await lang || "ENG"; // EST, ENG or RUS
    const generateDataButton = document.createElement("button");
    generateDataButton.textContent = generateDataButtonNames[language][0];
    generateDataButton.setAttribute("class", "uk-button uk-button-primary uk-button-arrow-left uk-float-right");
    const linkAndButtonParent = document.getElementById("filter");

    // prevents adding the button again when reloading the extension
    if (linkAndButtonParent.childElementCount < 2) {
        linkAndButtonParent.appendChild(generateDataButton);
    }

    // event listener
    generateDataButton.addEventListener("click", async () => {
        generateDataButton.disabled = true;

        const data = await fetchData(generateDataButton, language);
        handleData(data, "#history", "OR_balance.tsv", createTSV, language, linkAndButtonParent);
    });
})();
