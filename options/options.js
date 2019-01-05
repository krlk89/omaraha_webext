"use strict";

(() => {
    document.addEventListener("DOMContentLoaded", function() {
        chrome.storage.sync.get("language", lang => {
        document.getElementById("lang").value = lang.language || "ENG";
        });
    });
    
    document.getElementById("lang").addEventListener("change", function() {
        chrome.storage.sync.set({language: this.value});
    });
})();

