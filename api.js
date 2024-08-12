import Routes from "./routes.js";
//import Request from "./Request.js";

class API {

    test() {

        fetch('/').then((response) => {
            console.log(response.statusText);
        })

        // var request = new Request("asd", "POST");

        // let arrayBody = [
        //     { Person: "Maria", Age: 12 },
        //     { Person: "Sasha", Age: 14, 
        //         Grades: [
        //             { Math:12, Biology:10 }
        //         ]
        //     },
        // ];
    
        // let header = { 
        //     'Content-Type': 'application/json' 
        // }
        // let header2 = { 
        //     'Content-Type': 'application/json',
        //     'Something': 'better'
        // }

        // request.setBody(arrayBody);
        // request.addHeader(header);
        // request.addHeader(header2);

        // console.log(request);
    }

    async send(routeCode, body, searchParams) 
    {
        const route = Routes.get(routeCode);

        if(route === null || route === undefined || typeof route === 'undefined') {
            console.error(`API: Route path ${routeCode} was not found! Request hasn't been sent!`);
            return;
        }

        const cryptoId = this.#getCryptoId();

        if(cryptoId === null || cryptoId === undefined || !cryptoId.length) {
            console.error("API: Token (cryptoId) not found in URL. Request hasn't been sent!");
            return;
        }

        // cryptoId check validation method, to do!
        
        let url = route.url.href + 
            (searchParams !== undefined ? "?" + new URLSearchParams(searchParams) : "");

        let request = new Request(url, {
            method: route.method,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST,GET,PATCH,OPTIONS'
            },
            body: body,
        });

        return await this.#awaitResponse(request);
    }

    #getCryptoId() {
        return new URLSearchParams(window.location.search).get("cryptoId");
    }

    async #awaitResponse(request) {
        return await fetch(request)
            .then(response => {
                if(response.ok) {
                    return response.json();
                } 
                else {
                    throw new Error(`Request to ${request.url} return failed status! Check details...`);
                }
            })
            .then(json => {
                return json;
            })
            .catch(e => {
                console.error(`API.FETCH: ${e}`)
            });
    }


}

/*class API {

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

}*/

export default new API;
