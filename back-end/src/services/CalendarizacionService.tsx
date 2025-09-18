import axios from "axios";

const URL_BASE = "http://localhost:8080/calendarizacion";

class CalendarizacionService {

    findAll() {
        return axios.get(URL_BASE);
    }

    findById(idCalendarizacion: number) {
        return axios.get(URL_BASE + "/" + idCalendarizacion);
    }

    create(calendarizacion: object) {
        return axios.post(URL_BASE, calendarizacion);
    }

    update(idCalendarizacion: number, calendarizacion: object) {
        return axios.put(URL_BASE + "/" + idCalendarizacion, calendarizacion);
    }

    delete(idCalendarizacion: number) {
        return axios.delete(URL_BASE + "/" + idCalendarizacion);
    }

    findActividadById(IdCalendarizacion: number) {
        return axios.get(URL_BASE + "/actividad/" + IdCalendarizacion);
    }

    findMesById(IdCalendarizacion: number) {
        return axios.get(URL_BASE + "/mes/" + IdCalendarizacion);
    }
}

export default new CalendarizacionService();