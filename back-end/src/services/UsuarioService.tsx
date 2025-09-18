import axios from "axios";

const URL_BASE = "http://localhost:8080/usuario";

class UsuarioService {

    findAll() {
        return axios.get(URL_BASE);
    }

    findById(idUsuario: number) {
        return axios.get(URL_BASE + "/" + idUsuario);
    }

    create(usuario: object) {
        return axios.post(URL_BASE, usuario);
    }

    update(idUsuario: number, usuario: object) {
        return axios.put(URL_BASE + "/" + idUsuario, usuario);
    }

    delete(idUsuario: number) {
        return axios.delete(URL_BASE + "/" + idUsuario);
    }

    findUnidadById(IdUnidad: number) {
        return axios.get(URL_BASE + "/unidad/" + IdUnidad);
    }
}

export default new UsuarioService();