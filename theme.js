
class Theme {

    init() {

        const icons = document.querySelectorAll("object[type='image/svg+xml']");

        const primaryColor = window.Telegram.WebApp.MainButton.color ?? "#3478F6";

        icons.forEach(icon => {
            icon.addEventListener("load", function() {
                icon.contentDocument.querySelector("svg").style.stroke = primaryColor;
            });
        });
    }

}

export default new Theme();

