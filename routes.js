

class Routes {

    constructor() {

        this.baseUrl = "https://bot.kness.energy/KnessApp/v1";

        this.routes = [
            {
                title: "Виробничі завдання - отримання даних",
                code: "GET_PRODUCTION_TASKS",
                path: "/tempdata/get?id=fdc08e47b74050d2a8f9c1327237a5b80e6986112d5054a80987b586c69cb5f7",
                method: "GET",
            },
            {
                title: "Виробничі завдання 2",
                code: "PRODUCTION_TASKS_2",
                path: "/tempdata/get",
                method: "GET"
            },
            {
                title: "Виробничі завдання - передача даних",
                code: "POST_PRODUCTION_TASKS",
                path: "/construction/send",
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

