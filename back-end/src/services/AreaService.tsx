import axios from "axios";

const URL_BASE = "http://localhost:8080/area";

class AreaService {

    findAll() {
        return axios.get(URL_BASE);
    }

    findById(idArea: number) {
        return axios.get(URL_BASE + "/" + idArea);
    }

    create(area: object) {
        return axios.post(URL_BASE, area);
    }

    update(idArea: number, area: object) {
        return axios.put(URL_BASE + "/" + idArea, area);
    }

    delete(idArea: number) {
        return axios.delete(URL_BASE + "/" + idArea);
    }
}

export default new AreaService();