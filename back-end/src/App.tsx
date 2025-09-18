import './App.css';
import { PrimeReactProvider } from "primereact/api";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HeadComponent from "./components/HeadComponent";

import ListaPlanTrabajoComponent from "./components/plan-trabajo/ListaPlanTrabajoComponent.tsx";

/* CRUDs */
import CRUDRolComponent from "./components/roles/CRUDRolComponent.tsx";
import CRUDAreaComponent from "./components/areas/CRUDAreaComponent.tsx";
import CRUDUnidadComponent from "./components/unidades/CRUDUnidadComponent.tsx";
import CRUDUsuarioComponent from "./components/usuarios/CRUDUsuarioComponent.tsx";
import CRUDObjetivoComponent from "./components/objetivos/CRUDObjetivoComponent";
import CRUDComponenteComponent from "./components/componentes/CRUDComponenteComponent.tsx";
import CRUDUnidadMedidaComponent from "./components/unidades_medida/CRUDUnidadMedidaComponent.tsx";
import CRUDProgramaComponent from "./components/programas/CRUDProgramaComponent.tsx";
import CRUDActividadComponent from "./components/actividades/CRUDActividadComponent.tsx";
import CRUDCalendarizacionComponent from "./components/calendarizaciones/CRUDCalendarizacionComponent.tsx";

function App() {
    return (
        <PrimeReactProvider>
            <BrowserRouter>
                <HeadComponent/>
                <Routes>
                    <Route path="/plan-trabajo" element={<ListaPlanTrabajoComponent/>} />
                    <Route path="/rol" element={<CRUDRolComponent/>} />
                    <Route path="/area" element={<CRUDAreaComponent/>} />
                    <Route path="/unidad" element={<CRUDUnidadComponent/>} />
                    <Route path="/usuario" element={<CRUDUsuarioComponent/>} />
                    <Route path="/objetivo" element={<CRUDObjetivoComponent/>} />
                    <Route path="/componente" element={<CRUDComponenteComponent/>} />
                    <Route path="/unidad-medida" element={<CRUDUnidadMedidaComponent/>} />
                    <Route path="/programa" element={<CRUDProgramaComponent/>} />
                    <Route path="/actividad" element={<CRUDActividadComponent/>} />
                    <Route path="/calendarizacion" element={<CRUDCalendarizacionComponent/>} />
                </Routes>
            </BrowserRouter>
        </PrimeReactProvider>
    );
}

export default App;