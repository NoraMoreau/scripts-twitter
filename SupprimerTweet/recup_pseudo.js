let data_testid = document.querySelector('[data-testid^="UserAvatar-Container-"]');
let data_testid_attribut = data_testid.getAttribute("data-testid");
let pseudo = data_testid_attribut.replace("UserAvatar-Container-", "");
console.log("CONTENT_SCRIPT éxécuté : pseudo : ", pseudo);
browser.storage.local.set({ pseudo });