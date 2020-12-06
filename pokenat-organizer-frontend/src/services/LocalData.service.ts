import axios, { AxiosInstance } from "axios"

class LocalDataService {
    axios: AxiosInstance;

    constructor() {
        this.axios = axios.create({
            baseURL: "/api",
            headers: {
                "Content-type": "application/json"
            }
        })
    }

    getIndex(){
        return this.axios.get('/index.json')
    }

    getPokedex() {
        return this.axios.get('/data.json')
    }
}

export default new LocalDataService();