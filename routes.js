

class Routes {

    constructor() {

        this.baseUrl = "https://bot.kness.energy/KnessApp/v1";

        this.routes = [
            {
                title: "Виробничі завдання - отримання даних",
                code: "GET_PRODUCTION_TASKS",
                path: "/data/",
                method: "GET",
            },
            {
                title: "Виробничі завдання - передача даних",
                code: "POST_PRODUCTION_TASKS",
                path: "/data/",
                method: "POST"
            }
        ];
    }

    get(routeCode) {

        let route = this.routes.find(r => r.code === routeCode);

        if(route === null || route === undefined || route.length <= 0) {
            return undefined;
        }

        route.url = new URL(this.baseUrl + route.path);

        return route;
    }
}


export default new Routes;

