import axios from "axios";

const URL_BASE = "http://localhost:8080/mes";

class MesService {

    findAll() {
        return axios.get(URL_BASE);
    }

    findById(idMes: number) {
        return axios.get(URL_BASE + "/" + idMes);
    }

    create(mes: object) {
        return axios.post(URL_BASE, mes);
    }

    update(idMes: number, mes: object) {
        return axios.put(URL_BASE + "/" + idMes, mes);
    }

    delete(idMes: number) {
        return axios.delete(URL_BASE + "/" + idMes);
    }
}

export default new MesService();