/*
import React, { useState, useEffect, useRef } from 'react';
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { classNames } from "primereact/utils";
import { Calendar } from "primereact/calendar";
import ReporteService from "../../services/ReporteService";
import ActividadService from "../../services/ActividadService";

interface Actividad {
    idActividad: number;
    noActividad: number;
    nombreActividad: string;
    medioVerificacion: string;
    indicadorResultado: string;
}

interface Reporte {
    idReporte: number;
    fechaGeneracion: Date;
    trimestre: string;
    informeActividad: string;
    estado: string;
    actividad: Actividad;
}

export default function CRUDReporteComponent() {
    const emptyActividad: Actividad = {
        idActividad: 0,
        noActividad: 0,
        nombreActividad: '',
        medioVerificacion: '',
        indicadorResultado: ''
    };

    const emptyReporte: Reporte = {
        idReporte: 0,
        fechaGeneracion: new Date(),
        trimestre: '',
        informeActividad: '',
        estado: '',
        actividad: emptyActividad,
    };

    const [actividades, setActividades] = useState<Actividad[]>([]);
    const [reportes, setReportes] = useState<Reporte[]>([]);
    const [reporte, setReporte] = useState<Reporte>(emptyReporte);
    const [reporteDialog, setReporteDialog] = useState<boolean>(false);
    const [deleteReporteDialog, setDeleteReporteDialog] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Reporte[]>>(null);
    const [selectedActividad, setSelectedActividad] = useState<Actividad | null>(null);
    const [trimestres] = useState<string[]>(['Primer trimestre', 'Segundo trimestre', 'Tercer trimestre', 'Cuarto trimestre']);
    const [estados] = useState<string[]>(['Pendiente', 'En revisión', 'Aprobado', 'Rechazado']);

    useEffect(() => {
        ActividadService.findAll().then((responseA) => setActividades(responseA.data));
        ReporteService.findAll().then((response) => setReportes(response.data));
    }, []);

    const openNew = () => {
        setReporte(emptyReporte);
        setSelectedActividad(null);
        setSubmitted(false);
        setReporteDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setReporteDialog(false);
    };

    const hideDeleteReporteDialog = () => {
        setDeleteReporteDialog(false);
    };

    const saveReporte = async () => {
        setSubmitted(true);

        if (reporte.trimestre.trim() && reporte.informeActividad.trim() && reporte.estado.trim() && reporte.actividad.idActividad) {
            const _reportes = [...reportes];
            const _reporte = {...reporte};

            if (reporte.idReporte) {
                ReporteService.update(reporte.idReporte, reporte);
                const index = findIndexById(reporte.idReporte);
                _reportes[index] = _reporte;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Reporte Actualizado',
                    life: 3000
                });
            } else {
                _reporte.idReporte = await getIdReporte(_reporte);
                _reportes.push(_reporte);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Reporte Creado',
                    life: 3000
                });
            }

            setReportes(_reportes);
            setReporteDialog(false);
            setReporte(emptyReporte);
        }
    };

    const getIdReporte = async (_reporte: Reporte) => {
        let idReporte = 0;

        const newReporte = {
            fechaGeneracion: _reporte.fechaGeneracion,
            trimestre: _reporte.trimestre,
            informeActividad: _reporte.informeActividad,
            estado: _reporte.estado,
            actividad: _reporte.actividad,
        };

        await ReporteService.create(newReporte).then((response) => {
            idReporte = response.data.idReporte;
        }).catch(error => {
            console.log(error);
        });
        return idReporte;
    };

    const editReporte = (reporte: Reporte) => {
        setReporte({...reporte});
        setSelectedActividad(reporte.actividad);
        setReporteDialog(true);
    };

    const confirmDeleteReporte = (reporte: Reporte) => {
        setReporte(reporte);
        setDeleteReporteDialog(true);
    };

    const deleteReporte = () => {
        const _reportes = reportes.filter((val) => val.idReporte !== reporte.idReporte);
        ReporteService.delete(reporte.idReporte);
        setReportes(_reportes);
        setDeleteReporteDialog(false);
        setReporte(emptyReporte);
        toast.current?.show({
            severity: 'success',
            summary: 'Resultado',
            detail: 'Reporte Eliminado',
            life: 3000
        });
    };

    const findIndexById = (idReporte: number) => {
        let index = -1;
        for (let i = 0; i < reportes.length; i++) {
            if (reportes[i].idReporte === idReporte) {
                index = i;
                break;
            }
        }
        return index;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onFechaGeneracionChange = (e: any) => {
        const _reporte = {...reporte};
        _reporte.fechaGeneracion = e.value;
        setReporte(_reporte);
    };

    const onTrimestreChange = (e: DropdownChangeEvent) => {
        const _reporte = {...reporte};
        _reporte.trimestre = e.value;
        setReporte(_reporte);
    };

    const onInformeActividadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _reporte = {...reporte};
        _reporte.informeActividad = val;
        setReporte(_reporte);
    };

    const onEstadoChange = (e: DropdownChangeEvent) => {
        const _reporte = {...reporte};
        _reporte.estado = e.value;
        setReporte(_reporte);
    };

    const onActividadChange = (e: DropdownChangeEvent) => {
        const _reporte = {...reporte};
        const xactividad: Actividad = e.target.value;
        setSelectedActividad(xactividad);
        _reporte.actividad = xactividad;
        setReporte(_reporte);
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Exportar" icon="pi pi-upload" className="p-button-help" onClick={exportCSV}/>;
    };

    const actionBodyTemplate = (rowData: Reporte) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editReporte(rowData)}/>
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteReporte(rowData)}/>
            </React.Fragment>
        );
    };

    const formatDate = (rowData: Reporte) => {
        return new Date(rowData.fechaGeneracion).toLocaleDateString();
    };

    const actividadBodyTemplate = (rowData: Reporte) => {
        return rowData.actividad?.nombreActividad || '';
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Reportes</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" placeholder="Buscar..." onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    setGlobalFilter(target.value);
                }}/>
            </IconField>
        </div>
    );

    const reporteDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveReporte} />
        </React.Fragment>
    );

    const deleteReporteDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteReporteDialog} />
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteReporte} />
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <DataTable ref={dt} value={reportes} dataKey="idReporte" paginator rows={10}
                           rowsPerPageOptions={[5, 10, 25]} paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                           currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} reportes"
                           globalFilter={globalFilter} header={header}>
                    <Column field="idReporte" header="ID" sortable style={{ minWidth: '5rem' }}></Column>
                    <Column field="fechaGeneracion" header="Fecha Generación" body={formatDate} sortable style={{ minWidth: '10rem' }}></Column>
                    <Column field="trimestre" header="Trimestre" sortable style={{ minWidth: '15rem' }}></Column>
                    <Column field="informeActividad" header="Informe de la actividad" sortable style={{minWidth: '10rem'}}></Column>
                    <Column field="estado" header="Estado" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column field="actividad" header="Actividad" body={actividadBodyTemplate} sortable style={{ minWidth: '20rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={reporteDialog} style={{ width: '40rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                    header="Detalles del Reporte" modal className="p-fluid" footer={reporteDialogFooter} onHide={hideDialog}>

                <div className="field">
                    <label htmlFor="fechaGeneracion" className="font-bold">
                        Fecha Generación
                    </label>
                    <Calendar id="fechaGeneracion" value={reporte.fechaGeneracion} onChange={onFechaGeneracionChange}
                              showIcon dateFormat="dd/mm/yy" />
                </div>

                <div className="field">
                    <label htmlFor="trimestre" className="font-bold">
                        Trimestre
                    </label>
                    <Dropdown id="trimestre" value={reporte.trimestre} onChange={onTrimestreChange}
                              options={trimestres} placeholder="Seleccione un trimestre"
                              className={classNames({ 'p-invalid': submitted && !reporte.trimestre })} />
                    {submitted && !reporte.trimestre && <small className="p-error">Trimestre requerido.</small>}
                </div>

                <div className="field">
                    <label htmlFor="informeActividad" className="font-bold">Informe de la actividad</label>
                    <InputText id="informeActividad" value={reporte.informeActividad} onChange={(e) => onInformeActividadChange(e)} required autoFocus className={classNames({'p-invalid': submitted && !reporte.informeActividad})}/>
                    {submitted && !reporte.informeActividad && <small className="p-error">El informe de la actividad es requerido.</small>}
                </div>

                <div className="field">
                    <label htmlFor="estado" className="font-bold">
                        Estado
                    </label>
                    <Dropdown id="estado" value={reporte.estado} onChange={onEstadoChange}
                              options={estados} placeholder="Seleccione un estado"
                              className={classNames({ 'p-invalid': submitted && !reporte.estado })} />
                    {submitted && !reporte.estado && <small className="p-error">Estado requerido.</small>}
                </div>

                <div className="field">
                    <label className="font-bold block mb-2">
                        Actividad: {selectedActividad?.nombreActividad}
                    </label>
                    <Dropdown
                        value={selectedActividad}
                        onChange={onActividadChange}
                        options={actividades}
                        optionLabel="nombreActividad"
                        placeholder="Seleccionar una actividad"
                        className={classNames("w-full md:w-14rem", { 'p-invalid': submitted && !reporte.actividad.idActividad })}
                    />
                    {submitted && !reporte.actividad.idActividad && <small className="p-error">Actividad requerida.</small>}
                </div>
            </Dialog>

            <Dialog visible={deleteReporteDialog} style={{ width: '32rem' }}
                    breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                    header="Confirmar" modal footer={deleteReporteDialogFooter} onHide={hideDeleteReporteDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {reporte && <span>¿Estás seguro de eliminar el reporte {reporte.idReporte} - {reporte.trimestre}?</span>}
                </div>
            </Dialog>
        </div>
    );
}
 */