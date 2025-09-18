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
import EvidenciaService from "../../services/EvidenciaService";
import UnidadService from "../../services/UnidadService";
import ActividadService from "../../services/ActividadService";
import ReporteService from "../../services/ReporteService";

interface Unidad {
    idUnidad: number;
    nombreUnidad: string;
    email: string;
}

interface Actividad {
    idActividad: number;
    nombreActividad: string;
}

interface Reporte {
    idReporte: number;
    trimestre: string;
}

interface Evidencia {
    idEvidencia: number;
    descripcion: string;
    fechaSubida: Date;
    estado: string;
    archivo: string;
    unidad: Unidad;
    actividad: Actividad;
    reporte: Reporte;
}

export default function CRUDEvidenciaComponent() {
    const emptyUnidad: Unidad = {
        idUnidad: 0,
        nombreUnidad: '',
        email: ''
    };

    const emptyActividad: Actividad = {
        idActividad: 0,
        nombreActividad: ''
    };

    const emptyReporte: Reporte = {
        idReporte: 0,
        trimestre: ''
    };

    const emptyEvidencia: Evidencia = {
        idEvidencia: 0,
        descripcion: '',
        fechaSubida: new Date(),
        estado: '',
        archivo: '',
        unidad: emptyUnidad,
        actividad: emptyActividad,
        reporte: emptyReporte
    };

    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [actividades, setActividades] = useState<Actividad[]>([]);
    const [reportes, setReportes] = useState<Reporte[]>([]);
    const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
    const [evidencia, setEvidencia] = useState<Evidencia>(emptyEvidencia);
    const [evidenciaDialog, setEvidenciaDialog] = useState<boolean>(false);
    const [deleteEvidenciaDialog, setDeleteEvidenciaDialog] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Evidencia[]>>(null);
    const [selectedUnidad, setSelectedUnidad] = useState<Unidad | null>(null);
    const [selectedActividad, setSelectedActividad] = useState<Actividad | null>(null);
    const [selectedReporte, setSelectedReporte] = useState<Reporte | null>(null);
    const [estados] = useState<string[]>(['Pendiente', 'Aprobado', 'Rechazado']);

    useEffect(() => {
        UnidadService.findAll().then((responseU) => setUnidades(responseU.data));
        ActividadService.findAll().then((responseA) => setActividades(responseA.data));
        ReporteService.findAll().then((responseR) => setReportes(responseR.data));
        EvidenciaService.findAll().then((response) => setEvidencias(response.data));
    }, []);

    const openNew = () => {
        setEvidencia(emptyEvidencia);
        setSelectedUnidad(null);
        setSelectedActividad(null);
        setSelectedReporte(null);
        setSubmitted(false);
        setEvidenciaDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setEvidenciaDialog(false);
    };

    const hideDeleteEvidenciaDialog = () => {
        setDeleteEvidenciaDialog(false);
    };

    const saveEvidencia = async () => {
        setSubmitted(true);

        if (evidencia.descripcion.trim() && evidencia.estado.trim() && evidencia.archivo.trim() &&
            evidencia.unidad.idUnidad && evidencia.actividad.idActividad && evidencia.reporte.idReporte) {

            const _evidencias = [...evidencias];
            const _evidencia = {...evidencia};

            if (evidencia.idEvidencia) {
                EvidenciaService.update(evidencia.idEvidencia, evidencia);
                const index = findIndexById(evidencia.idEvidencia);
                _evidencias[index] = _evidencia;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Evidencia Actualizada',
                    life: 3000
                });
            } else {
                _evidencia.idEvidencia = await getIdEvidencia(_evidencia);
                _evidencias.push(_evidencia);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Evidencia Creada',
                    life: 3000
                });
            }

            setEvidencias(_evidencias);
            setEvidenciaDialog(false);
            setEvidencia(emptyEvidencia);
        }
    };

    const getIdEvidencia = async (_evidencia: Evidencia) => {
        let idEvidencia = 0;
        const newEvidencia = {
            descripcion: _evidencia.descripcion,
            fechaSubida: _evidencia.fechaSubida,
            estado: _evidencia.estado,
            archivo: _evidencia.archivo,
            unidad: _evidencia.unidad,
            actividad: _evidencia.actividad,
            reporte: _evidencia.reporte
        };

        await EvidenciaService.create(newEvidencia).then((response) => {
            idEvidencia = response.data.idEvidencia;
        }).catch(error => {
            console.log(error);
        });
        return idEvidencia;
    };

    const editEvidencia = (evidencia: Evidencia) => {
        setEvidencia({...evidencia});
        setSelectedUnidad(evidencia.unidad);
        setSelectedActividad(evidencia.actividad);
        setSelectedReporte(evidencia.reporte);
        setEvidenciaDialog(true);
    };

    const confirmDeleteEvidencia = (evidencia: Evidencia) => {
        setEvidencia(evidencia);
        setDeleteEvidenciaDialog(true);
    };

    const deleteEvidencia = () => {
        const _evidencias = evidencias.filter((val) => val.idEvidencia !== evidencia.idEvidencia);
        EvidenciaService.delete(evidencia.idEvidencia);
        setEvidencias(_evidencias);
        setDeleteEvidenciaDialog(false);
        setEvidencia(emptyEvidencia);
        toast.current?.show({
            severity: 'success',
            summary: 'Resultado',
            detail: 'Evidencia Eliminada',
            life: 3000
        });
    };

    const findIndexById = (idEvidencia: number) => {
        let index = -1;
        for (let i = 0; i < evidencias.length; i++) {
            if (evidencias[i].idEvidencia === idEvidencia) {
                index = i;
                break;
            }
        }
        return index;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onFechaSubidaChange = (e: any) => {
        const _evidencia = {...evidencia};
        _evidencia.fechaSubida = e.value;
        setEvidencia(_evidencia);
    };

    const onEstadoChange = (e: DropdownChangeEvent) => {
        const _evidencia = {...evidencia};
        _evidencia.estado = e.value;
        setEvidencia(_evidencia);
    };

    const onUnidadChange = (e: DropdownChangeEvent) => {
        const _evidencia = {...evidencia};
        const unidad: Unidad = e.value;
        setSelectedUnidad(unidad);
        _evidencia.unidad = unidad;
        setEvidencia(_evidencia);
    };

    const onActividadChange = (e: DropdownChangeEvent) => {
        const _evidencia = {...evidencia};
        const actividad: Actividad = e.value;
        setSelectedActividad(actividad);
        _evidencia.actividad = actividad;
        setEvidencia(_evidencia);
    };

    const onReporteChange = (e: DropdownChangeEvent) => {
        const _evidencia = {...evidencia};
        const reporte: Reporte = e.value;
        setSelectedReporte(reporte);
        _evidencia.reporte = reporte;
        setEvidencia(_evidencia);
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

    const actionBodyTemplate = (rowData: Evidencia) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editEvidencia(rowData)}/>
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteEvidencia(rowData)}/>
            </React.Fragment>
        );
    };

    const formatDate = (rowData: Evidencia) => {
        return new Date(rowData.fechaSubida).toLocaleDateString();
    };

    const unidadBodyTemplate = (rowData: Evidencia) => {
        return rowData.unidad?.nombreUnidad || '';
    };

    const actividadBodyTemplate = (rowData: Evidencia) => {
        return rowData.actividad?.nombreActividad || '';
    };

    const reporteBodyTemplate = (rowData: Evidencia) => {
        return rowData.reporte?.trimestre || '';
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Evidencias</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" placeholder="Buscar..." onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    setGlobalFilter(target.value);
                }}/>
            </IconField>
        </div>
    );

    const evidenciaDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveEvidencia} />
        </React.Fragment>
    );

    const deleteEvidenciaDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteEvidenciaDialog} />
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteEvidencia} />
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <DataTable ref={dt} value={evidencias} dataKey="idEvidencia" paginator rows={10}
                           rowsPerPageOptions={[5, 10, 25]} paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                           currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} evidencias"
                           globalFilter={globalFilter} header={header}>
                    <Column field="idEvidencia" header="ID" sortable style={{ minWidth: '5rem' }}></Column>
                    <Column field="descripcion" header="Descripción" sortable style={{ minWidth: '15rem' }}></Column>
                    <Column field="fechaSubida" header="Fecha Subida" body={formatDate} sortable style={{ minWidth: '10rem' }}></Column>
                    <Column field="estado" header="Estado" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column field="archivo" header="Archivo" sortable style={{ minWidth: '15rem' }}></Column>
                    <Column field="unidad" header="Unidad" body={unidadBodyTemplate} sortable style={{ minWidth: '15rem' }}></Column>
                    <Column field="actividad" header="Actividad" body={actividadBodyTemplate} sortable style={{ minWidth: '15rem' }}></Column>
                    <Column field="reporte" header="Reporte" body={reporteBodyTemplate} sortable style={{ minWidth: '15rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={evidenciaDialog} style={{ width: '40rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                    header="Detalles de la Evidencia" modal className="p-fluid" footer={evidenciaDialogFooter} onHide={hideDialog}>

                <div className="field">
                    <label htmlFor="descripcion" className="font-bold">
                        Descripción
                    </label>
                    <InputText id="descripcion" value={evidencia.descripcion}
                               onChange={(e) => setEvidencia({...evidencia, descripcion: e.target.value})}
                               className={classNames({ 'p-invalid': submitted && !evidencia.descripcion })} />
                    {submitted && !evidencia.descripcion && <small className="p-error">Descripción requerida.</small>}
                </div>

                <div className="field">
                    <label htmlFor="fechaSubida" className="font-bold">
                        Fecha Subida
                    </label>
                    <Calendar id="fechaSubida" value={evidencia.fechaSubida} onChange={onFechaSubidaChange}
                              showIcon dateFormat="dd/mm/yy" />
                </div>

                <div className="field">
                    <label htmlFor="estado" className="font-bold">
                        Estado
                    </label>
                    <Dropdown id="estado" value={evidencia.estado} onChange={onEstadoChange}
                              options={estados} placeholder="Seleccione un estado"
                              className={classNames({ 'p-invalid': submitted && !evidencia.estado })} />
                    {submitted && !evidencia.estado && <small className="p-error">Estado requerido.</small>}
                </div>

                <div className="field">
                    <label htmlFor="archivo" className="font-bold">
                        Archivo
                    </label>
                    <InputText id="archivo" value={evidencia.archivo}
                               onChange={(e) => setEvidencia({...evidencia, archivo: e.target.value})}
                               className={classNames({ 'p-invalid': submitted && !evidencia.archivo })} />
                    {submitted && !evidencia.archivo && <small className="p-error">Archivo requerido.</small>}
                </div>

                <div className="field">
                    <label className="font-bold block mb-2">
                        Unidad
                    </label>
                    <Dropdown
                        value={selectedUnidad}
                        onChange={onUnidadChange}
                        options={unidades}
                        optionLabel="nombreUnidad"
                        placeholder="Seleccionar unidad"
                        className={classNames("w-full", { 'p-invalid': submitted && !evidencia.unidad.idUnidad })}
                    />
                    {submitted && !evidencia.unidad.idUnidad && <small className="p-error">Unidad requerida.</small>}
                </div>

                <div className="field">
                    <label className="font-bold block mb-2">
                        Actividad
                    </label>
                    <Dropdown
                        value={selectedActividad}
                        onChange={onActividadChange}
                        options={actividades}
                        optionLabel="nombreActividad"
                        placeholder="Seleccionar actividad"
                        className={classNames("w-full", { 'p-invalid': submitted && !evidencia.actividad.idActividad })}
                    />
                    {submitted && !evidencia.actividad.idActividad && <small className="p-error">Actividad requerida.</small>}
                </div>

                <div className="field">
                    <label className="font-bold block mb-2">
                        Reporte
                    </label>
                    <Dropdown
                        value={selectedReporte}
                        onChange={onReporteChange}
                        options={reportes}
                        optionLabel="trimestre"
                        placeholder="Seleccionar reporte"
                        className={classNames("w-full", { 'p-invalid': submitted && !evidencia.reporte.idReporte })}
                    />
                    {submitted && !evidencia.reporte.idReporte && <small className="p-error">Reporte requerido.</small>}
                </div>
            </Dialog>

            <Dialog visible={deleteEvidenciaDialog} style={{ width: '32rem' }}
                    breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                    header="Confirmar" modal footer={deleteEvidenciaDialogFooter} onHide={hideDeleteEvidenciaDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {evidencia && <span>¿Estás seguro de eliminar la evidencia {evidencia.idEvidencia} - {evidencia.descripcion}?</span>}
                </div>
            </Dialog>
        </div>
    );
}
 */