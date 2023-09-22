


class Theme {

    constructor() {
        //this.primary_color = window.Telegra
    }

    init() {

        const icons = document.querySelectorAll("object[type='image/svg+xml']");

        icons.forEach(icon => {

            icon.addEventListener("load", function() {
                icon.contentDocument.querySelector("svg").style.stroke = "red";
            });

            
        });


        alert(JSON.stringify(window.Telegram.WebApp.themeParams));

    }

    



}

export default new Theme();

