import axios from "axios";

const URL_BASE = "http://localhost:8080/reporte";

class ReporteService {

    findAll() {
        return axios.get(URL_BASE);
    }

    findById(idReporte: number) {
        return axios.get(URL_BASE + "/" + idReporte);
    }

    create(reporte: object) {
        return axios.post(URL_BASE, reporte);
    }

    update(idReporte: number, reporte: object) {
        return axios.put(URL_BASE + "/" + idReporte, reporte);
    }

    delete(idReporte: number) {
        return axios.delete(URL_BASE + "/" + idReporte);
    }

    findActividadById(IdUnidad: number) {
        return axios.get(URL_BASE + "/actividad/" + IdUnidad);
    }
}

export default new ReporteService();