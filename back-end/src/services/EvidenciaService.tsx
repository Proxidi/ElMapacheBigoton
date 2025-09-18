import axios from "axios";

const URL_BASE = "http://localhost:8080/evidencia";

class EvidenciaService {

    findAll() {
        return axios.get(URL_BASE);
    }

    findById(idEvidencia: number) {
        return axios.get(URL_BASE + "/" + idEvidencia);
    }

    create(evidencia: object) {
        return axios.post(URL_BASE, evidencia);
    }

    update(idEvidencia: number, evidencia: object) {
        return axios.put(URL_BASE + "/" + idEvidencia, evidencia);
    }

    delete(idEvidencia: number) {
        return axios.delete(URL_BASE + "/" + idEvidencia);
    }

    findUnidadById(IdUnidad: number) {
        return axios.get(URL_BASE + "/unidad/" + IdUnidad);
    }

    findActividadById(IdUnidad: number) {
        return axios.get(URL_BASE + "/actividad/" + IdUnidad);
    }

    findReporteById(IdUnidad: number) {
        return axios.get(URL_BASE + "/reporte/" + IdUnidad);
    }
}

export default new EvidenciaService();