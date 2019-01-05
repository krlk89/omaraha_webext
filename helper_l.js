function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

async function fetchData(btn, language) {
    const urlData = window.location;
    let searchStr = urlData.search ? urlData.search : "";
    searchStr = searchStr.replace(/\?(page=\d+&)?/, "");
    const pages = document.querySelectorAll("ul.uk-pagination > li.uk-text-bold");
    const pageCount = pages.length > 0 ? parseInt(pages[pages.length - 1].textContent) : 1;
    const dataArray = [];
    let promise;
    let response;
    let data;

    for (let i = 1; i <= pageCount; i++) {
        btn.textContent = `${i} / ${pageCount}`;

        try {
            promise = fetch(`${urlData.origin}${urlData.pathname}?page=${i}&${searchStr}`);
            response = await promise;
            data = await response.text();
        }
        catch (err) {
            console.error(err);
        }

        dataArray.push(data);

        await wait(2000);
    }
    btn.textContent = generateDataButtonNames[language][1];

    return dataArray;
}

function handleData(data, queryStr, linkName, createTSV, language, linkAndButtonParent) {
    const dlLink = document.createElement("a");
    let tsvContent = "data:text/tab-separated-values;charset=utf-8,";
    let range;
    let documentFragment;
    let historyTable;

    for (let i = 0; i < data.length; i++) {
        range = document.createRange();
        documentFragment = range.createContextualFragment(data[i]);
        historyTable = documentFragment.querySelector(queryStr);

        tsvContent += createTSV(historyTable, i, data.length - 1);
    }

    dlLink.setAttribute("href", encodeURI(tsvContent));
    dlLink.setAttribute("download", linkName);
    dlLink.textContent = dlLinkNames[language];
    linkAndButtonParent.appendChild(dlLink);
}

const generateDataButtonNames = {
    EST: ["Koosta .tsv", "Fail valmis"],
    ENG: ["Generate .tsv", "File ready"],
    RUS: ["генерировать .tsv", "файл готов"]
};

const statuses = {
    EST: { green: "Roheline", yellow: "Kollane", red: "Punane", blue: "Sinine", status: "Staatus" },
    ENG: { green: "Green", yellow: "Yellow", red: "Red", blue: "Blue", status: "Status" },
    RUS: { green: "зеленый", yellow: "желтый", red: "красный", blue: "синий", status: "статус" }
};
