const dlLinkNames = {
    EST: "Lae alla .tsv",
    ENG: "Download .tsv",
    RUS: "скачать .tsv"
};

// chrome api does not support promises natively
let lang = new Promise(resolve =>
    chrome.storage.sync.get("language", language => {
        resolve(language.language);
    })
);
