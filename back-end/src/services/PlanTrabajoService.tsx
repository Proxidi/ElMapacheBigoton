import axios from 'axios';

const URL = 'http://localhost:8080/plan-trabajo';

class PlanTrabajoService {
    fetchAll() {
        return axios.get(URL);
    }
}

export default new PlanTrabajoService();