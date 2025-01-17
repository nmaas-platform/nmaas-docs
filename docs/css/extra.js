document.addEventListener("DOMContentLoaded", function() {
    let customBar = document.createElement("div");
    customBar.className = "custom-bar";
    customBar.innerHTML = 'nmaas is now on <a href="https://discord.gg/CZzvZH2TAe" target="_blank"> Discord <img style="margin-left:5px;" src="/img/discord-logo.png" height="15px"></a>';
    let navBar = document.querySelector(".md-header");
    navBar.after(customBar);
});
