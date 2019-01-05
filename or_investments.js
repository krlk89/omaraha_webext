"use strict";

(async () => {
    function createTSV(table, index) {
        const data = table.rows;
        const start = index === 0 ? 0 : 1; // skip header row after first table
        let status;
        let content = "";
        let row;
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

            content += `${status}\t${row.map(formatter).join("\t")}\n`;
        }

        return content;
    }

    const language = await lang || "ENG"; // EST, ENG or RUS
    const generateDataButton = document.createElement("button");
    generateDataButton.textContent = generateDataButtonNames[language][0];
    generateDataButton.setAttribute("class", "uk-button uk-button-primary uk-align-right");
    const linkAndButtonParent = document.getElementsByClassName("uk-clearfix")[1];

    // prevents adding the button again when reloading the extension
    if (linkAndButtonParent.childElementCount < 3) {
        linkAndButtonParent.appendChild(generateDataButton);
    }

    // event listener
    generateDataButton.addEventListener("click", async () => {
        generateDataButton.disabled = true;

        const data = await fetchData(generateDataButton, language);
        handleData(data, "table", "OR_investments.tsv", createTSV, language, linkAndButtonParent);
    });
})();
