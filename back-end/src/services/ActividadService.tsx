import axios from "axios";

const URL_BASE = "http://localhost:8080/actividad";

class ActividadService {
    findAll() {
        return axios.get(URL_BASE);
    }

    findById(idActividad: number) {
        return axios.get(`${URL_BASE}/${idActividad}`);
    }

    create(actividad: object) {
        return axios.post(URL_BASE, actividad);
    }

    update(idActividad: number, actividad: object) {
        return axios.put(`${URL_BASE}/${idActividad}`, actividad);
    }

    delete(idActividad: number) {
        return axios.delete(`${URL_BASE}/${idActividad}`);
    }

    findProgramaById(IdActividad: number) {
        return axios.get(URL_BASE + "/programa/" + IdActividad);
    }

    findObjetivoById(IdActividad: number) {
        return axios.get(URL_BASE + "/objetivo/" + IdActividad);
    }

    findComponenteById(IdActividad: number) {
        return axios.get(URL_BASE + "/componente/" + IdActividad);
    }

    findUnidadMedidaById(IdActividad: number) {
        return axios.get(URL_BASE + "/unidad-medida/" + IdActividad);
    }
}

export default new ActividadService();