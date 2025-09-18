import axios from "axios";

const URL_BASE = "http://localhost:8080/unidad";

class UnidadService {
    findAll() {
        return axios.get(URL_BASE);
    }

    findById(idUnidad: number) {
        return axios.get(`${URL_BASE}/${idUnidad}`);
    }

    create(unidad: object) {
        return axios.post(URL_BASE, unidad);
    }

    update(idUnidad: number, unidad: object) {
        return axios.put(`${URL_BASE}/${idUnidad}`, unidad);
    }

    delete(idUnidad: number) {
        return axios.delete(`${URL_BASE}/${idUnidad}`);
    }

    findAreaById(IdUnidad: number) {
        return axios.get(URL_BASE + "/area/" + IdUnidad);
    }

    findRolById(IdUnidad: number) {
        return axios.get(URL_BASE + "/rol/" + IdUnidad);
    }
}

export default new UnidadService();