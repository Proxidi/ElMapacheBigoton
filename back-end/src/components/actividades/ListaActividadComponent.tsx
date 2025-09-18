import {useEffect, useState} from "react";
import ActividadService from "../../services/ActividadService.tsx";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";

interface Actividad {
    idActividad: number;
    noActividad: number;
    nombreActividad: string;
    informeActividad: string;
    medioVerificacion: string;
    indicadorResultado: string;
}

export default function ListaActividadComponent() {
    const [actividades, setActividades] = useState<Actividad[]>([]);

    useEffect(() => {
        ActividadService.findAll().then(response => {
            setActividades(response.data);
        }).catch(error => {
            console.log(error);
        });
    }, []);

    return (
        <div className="card">
            <DataTable value={actividades} tableStyle={{ minWidth: '50rem' }}>
                <Column field="noActividad" header="Número de la actividad" />
                <Column field="nombreActividad" header="Nombre de la actividad" />
                <Column field="informeActividad" header="Informe de la actividad" />
                <Column field="medioVerificacion" header="Medio de verificación" />
                <Column field="indicadorResultado" header="Indicador de resultado" />
            </DataTable>
        </div>
    );
}
