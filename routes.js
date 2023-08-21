

class Routes {

    constructor() {

        this.baseUrl = "https://bot.kness.energy/KnessApp/v1/";

        this.routes = [
            {
                title: "Виробничі завдання",
                code: "PRODUCTION_TASKS",
                path: "/tempdata/get",
            },
            {
                title: "Виробничі завдання 2",
                code: "PRODUCTION_TASKS_2",
                path: "/tempdata/get",
            }
        ];
    }

    getPath(routeCode) {
        return new URL(this.baseUrl + 
            this.routes.find(route => route.code == routeCode).path);
    }

}

export default new Routes;

