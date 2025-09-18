import axios from "axios";

const URL_BASE = "http://localhost:8080/objetivo";

class ObjetivoService {
    findAll() {
        return axios.get(URL_BASE);
    }

    findById(idObjetivo: number) {
        return axios.get(`${URL_BASE}/${idObjetivo}`);
    }

    create(objetivo: object) {
        return axios.post(URL_BASE, objetivo);
    }

    update(idObjetivo: number, objetivo: object) {
        return axios.put(`${URL_BASE}/${idObjetivo}`, objetivo);
    }

    delete(idObjetivo: number) {
        return axios.delete(`${URL_BASE}/${idObjetivo}`);
    }
}

export default new ObjetivoService();
