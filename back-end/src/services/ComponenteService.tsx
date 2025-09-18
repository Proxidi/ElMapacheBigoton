import axios from "axios";

const URL_BASE = "http://localhost:8080/componente";

class ComponenteService {

    findAll() {
        return axios.get(URL_BASE);
    }

    findById(idComponente: number) {
        return axios.get(URL_BASE + "/" + idComponente);
    }

    create(componente: object) {
        return axios.post(URL_BASE, componente);
    }

    update(idComponente: number, componente: object) {
        return axios.put(URL_BASE + "/" + idComponente, componente);
    }

    delete(idComponente: number) {
        return axios.delete(URL_BASE + "/" + idComponente);
    }
}

export default new ComponenteService();