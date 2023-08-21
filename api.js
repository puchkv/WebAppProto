import Routes from "./routes.js";
import RequestStatus from "./statuses.js";

class API {

    constructor() 
    {
        this.instance = new XMLHttpRequest();
        this.responseType = "json";
        this.currentRoute = "";
        this.errorCode = 0;
    
        this.response = null;
    }

    send(routeCode, method, params = null) 
    {
        const path = Routes.getPath(routeCode);

        if(path == null || typeof path === 'undefined') {
            this.errorCode = RequestStatus.NOT_FOUND;
            console.log("Path to route not found: " + this.errorCode);
        }

        this.#send(path, method, params);
    }

    #send(path, method, params = null) {
        try
        {
            console.log(`Path: ${path}`);
            
            path.searchParams.append('id', this.#getCryptoId());
            
            this.instance.open(method, path);

            this.#setRequestHeaders();

            this.instance.send({ id: this.cryptoId });
            this.instance.responseType = this.responseType;

            this.instance.onload = () => this.#GetResponse();

        } catch (exception) {
            console.log(exception);
        }

    }


    #setRequestHeaders() {
        this.instance.setRequestHeader("Access-Control-Allow-Origin", "*");
        this.instance.setRequestHeader("Access-Control-Allow-Credentials", "true");
        this.instance.setRequestHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
        this.instance.setRequestHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    }

    #GetResponse() {

        if(this.instance.readyState == RequestStatus.READY &&
            this.instance.status == RequestStatus.SUCCESS) {
            
            this.response = this.instance.response;
            
        }
        else 
        {
            console.log('Error: ' + this.instance.status);
        }
    }

    #getCryptoId() {
        return new URLSearchParams(window.location.search).get("cryptoId");
    }

}

export default new API;
