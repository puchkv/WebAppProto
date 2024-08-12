export default class Request {

    Properties = {
        Url: "",
        Method: "",
        Headers: {},
        Body: [],
        Mode: "",
        Cache: "",
        Credentials: "",
        Redirect: "",
        ReferrerPolicy: "",
    }

    constructor(url, method = "GET", mode = "cors", cache = "no-cache", 
    credentials = "same-origin", redirect = "follow", referrerPolicy = "no-referrer" ) {
        this.Properties.Url = url;
        this.Properties.Method = method;
        this.Properties.Mode = mode;
        this.Properties.Cache = cache;
        this.Properties.Credentials = credentials;
        this.Properties.Redirect = redirect;
        this.Properties.ReferrerPolicy = referrerPolicy;
    }

    setBody(body) {

        if(!Array.isArray(body) && typeof body !== 'object')
        {
            console.error("Request body must be array of objects or an object itself!");
            return;
        } 

        this.Properties.Body = body;
    }

    addHeader(header) {

        if(this.#isHeaderKeyExists(header)) {
            console.error(`Request: headers not valid or keys already exists!`);
            return;
        }
    
        Object.assign(this.Properties.Headers, header);

        //this.Properties.Headers.push(header);
    }


    #isHeaderKeyExists(headerObject) {

        let isExist = false;

        if(typeof headerObject !== 'object') {
            console.error("API: Header must be type of object or object is invalid");
            return false;
        }

        Object.keys(this.Properties.Headers).forEach(k => {
            if(Object.keys(headerObject).includes(k)) {
                
                isExist = true;
                console.warn(`%cRequest: ${k} already exists in headers`, 'font-weight:bold;');
                return;
            }
        });
        
        return isExist;
    }
}
