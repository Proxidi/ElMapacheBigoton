import axios from "axios";

const URL_BASE = "http://localhost:8080/unidad-medida";

class UnidadMedidaService {
    findAll() {
        return axios.get(URL_BASE);
    }

    findById(idUnidadMedida: number) {
        return axios.get(`${URL_BASE}/${idUnidadMedida}`);
    }

    create(unidadMedida: object) {
        return axios.post(URL_BASE, unidadMedida);
    }

    update(idUnidadMedida: number, unidad: object) {
        return axios.put(`${URL_BASE}/${idUnidadMedida}`, unidad);
    }

    delete(idUnidadMedida: number) {
        return axios.delete(`${URL_BASE}/${idUnidadMedida}`);
    }
}

export default new UnidadMedidaService();