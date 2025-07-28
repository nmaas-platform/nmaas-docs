document.addEventListener("DOMContentLoaded", function() {
    let customBar = document.createElement("div");
    customBar.className = "custom-bar";
    customBar.innerHTML =' <div style="display: flex; justify-content: center">Explore code at ' +
        '                   <a href="https://gitlab.software.geant.org/nmaas" target="_blank"> GitLab ' +
        '                       <img style="margin-left:5px;" src="/img/gitlab-logo.png" height="15px">' +
        '                   </a>' +
        '                </div> '+
        '               <div style="display: flex; justify-content: center">nmaas is now on ' +
        '                   <a href="https://discord.gg/CZzvZH2TAe" target="_blank"> Discord ' +
        '                       <img style="margin-left:5px;" src="/img/discord-logo.png" height="15px">' +
        '                   </a>' +
        '               </div> ' +
        '               <div style="display: flex; justify-content: center">Join our ' +
        '                   <a href="https://www.linkedin.com/groups/10068131/" target="_blank"> LinkedIn group ' +
        '                       <img style="margin-left:5px;" src="/img/linkedin-logo.png" height="15px">' +
        '                   </a>' +
        '               </div> ';
    let navBar = document.querySelector(".md-header");
    navBar.after(customBar);
});
