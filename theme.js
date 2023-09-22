


class Theme {

    constructor() {
        const colors = window.Telegram.WebApp.themeParams;
    }

    init() {

        const icons = document.querySelectorAll("object[type='image/svg+xml']");

        icons.forEach(icon => {

            icon.addEventListener("load", function() {
                icon.contentDocument.querySelector("svg").style.stroke = "red";
            });

            
        });

        this.#apply();
    }


    #apply() {

        if(this.colors === undefined) {
            return;
        }

        if(this.colors.bg_color !== undefined) {
            document.querySelector("body").style.background = this.colors.bg_color;
        }

        if(this.colors.text_color !== undefined) {
            document.querySelector("body").style.color = this.colors.text_color;
        }

        

    }

}

export default new Theme();

