


class PopupMessage {

    TIMEOUT = 3000; // 3s showing popup by default
    TIMER = null;

    constructor() {

        this.Element = document.createElement("div");
        
        this.Properties = {
            ClassName: 'popup-message',
            Padding: '6px 12px',
            Radius: '6px',
            Border: '',
            Background: '#ff0122',
            Text: '',
            X: 0,
            Y: 0,
            Width: 0,
            Height: 0,
        }

        document.querySelector("body").onscroll = () => {
            this.Hide();
        }
    }

    Show(text, element) {
        
        if(!element)
            return console.error(`PopupMessage.Show(): element not found`);

        this.#create(text);

        const elRect = element.getBoundingClientRect();
        
        this.Element.style.top = `${elRect.top + window.scrollY + element.offsetHeight + 6}px`;
        this.Element.style.left = `${elRect.left}px`;

        document.querySelector("body").appendChild(this.Element);

        return this.#Hide();        
    }

    #Hide(timeout = this.TIMEOUT) {
        if(this.Element !== null || this.Element !== undefined) {
            clearTimeout(this.TIMER);
            this.TIMER = setTimeout(() => this.Hide(), timeout);
        }        
    }

    Hide()       
    {
        if(this.Element !== null && this.Element !== undefined) {
            this.Element.remove();
        }
    }


    #create(text) {

        try {  

            this.Properties.Text = text;
            
            this.Element.className = this.Properties.ClassName;
            this.Element.style.background = this.Properties.Background;
            this.Element.style.padding = this.Properties.Padding;
            this.Element.style.borderRadius = this.Properties.Radius;
            this.Element.style.border = this.Properties.Border;
            this.Element.style.zIndex = 999;
            
            this.Element.innerHTML = this.Properties.Text;

        } 
        catch (exception) {
            return console.error(`[Exception]: PopupMessage.create: ${exception}`);
        }
    }

}

export default new PopupMessage();
