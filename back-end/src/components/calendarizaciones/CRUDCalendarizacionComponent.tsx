import React, { useState, useEffect, useRef } from 'react';
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dialog } from "primereact/dialog";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { classNames } from "primereact/utils";
import CalendarizacionService from "../../services/CalendarizacionService";
import MesService from "../../services/MesService";
import ActividadService from "../../services/ServicioService";

interface Mes {
    idMes: number;
    nombreMes: string;
}

interface Actividad {
    idActividad: number;
    nombreActividad: string;
    noActividad: number;
}

interface Calendarizacion {
    idCalendarizacion: number;
    actividad: Actividad;
    mes: Mes;
    presupuesto: number;
}

export default function CRUDCalendarizacionComponent() {
    const emptyMes: Mes = {
        idMes: 0,
        nombreMes: '',
    };

    const emptyActividad: Actividad = {
        idActividad: 0,
        nombreActividad: '',
        noActividad: 0,
    };

    const emptyCalendarizacion: Calendarizacion = {
        idCalendarizacion: 0,
        actividad: emptyActividad,
        mes: emptyMes,
        presupuesto: 0,
    };

    const [meses, setMeses] = useState<Mes[]>([]);
    const [actividades, setActividades] = useState<Actividad[]>([]);
    const [calendarizaciones, setCalendarizaciones] = useState<Calendarizacion[]>([]);
    const [calendarizacion, setCalendarizacion] = useState<Calendarizacion>(emptyCalendarizacion);
    const [calendarizacionDialog, setCalendarizacionDialog] = useState<boolean>(false);
    const [deleteCalendarizacionDialog, setDeleteCalendarizacionDialog] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Calendarizacion[]>>(null);
    const [selectedMes, setSelectedMes] = useState<Mes | null>(null);
    const [selectedActividad, setSelectedActividad] = useState<Actividad | null>(null);

    useEffect(() => {
        MesService.findAll().then((responseM) => setMeses(responseM.data));
        ActividadService.findAll().then((responseA) => setActividades(responseA.data));
        CalendarizacionService.findAll().then((response) => setCalendarizaciones(response.data));
    }, []);

    const openNew = () => {
        setCalendarizacion(emptyCalendarizacion);
        setSelectedMes(null);
        setSelectedActividad(null);
        setSubmitted(false);
        setCalendarizacionDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setCalendarizacionDialog(false);
    };

    const hideDeleteCalendarizacionDialog = () => {
        setDeleteCalendarizacionDialog(false);
    };

    const saveCalendarizacion = async () => {
        setSubmitted(true);
        if (calendarizacion.presupuesto > 0 && calendarizacion.mes && calendarizacion.actividad) {
            const _calendarizaciones = [...calendarizaciones];
            const _calendarizacion = {...calendarizacion};

            if (calendarizacion.idCalendarizacion) {
                CalendarizacionService.update(calendarizacion.idCalendarizacion, calendarizacion);
                const index = findIndexById(calendarizacion.idCalendarizacion);
                _calendarizaciones[index] = _calendarizacion;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Registro Actualizado',
                    life: 3000
                });
            } else {
                _calendarizacion.idCalendarizacion = await getIdCalendarizacion(_calendarizacion);
                _calendarizaciones.push(_calendarizacion);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Registro Creado',
                    life: 3000
                });
            }

            setCalendarizaciones(_calendarizaciones);
            setCalendarizacionDialog(false);
            setCalendarizacion(emptyCalendarizacion);
        }
    };

    const getIdCalendarizacion = async (_calendarizacion: Calendarizacion) => {
        let idCalendarizacion = 0;

        const newCalendarizacion = {
            presupuesto: _calendarizacion.presupuesto,
            actividad:{
                idActividad: selectedActividad?.idActividad,
            },
            mes:{
                idMes: selectedMes?.idMes,
            },
        };

        await CalendarizacionService.create(newCalendarizacion).then((response) => {
            idCalendarizacion = response.data.idCalendarizacion;
        }).catch(error => {
            console.log(error);
        });
        return idCalendarizacion;
    };

    const editCalendarizacion = (c: Calendarizacion) => {
        setCalendarizacion({...c});
        const actividadActual = actividades.find(a => a.idActividad === c.actividad.idActividad);
        const mesActual = meses.find(m => m.idMes === c.mes.idMes);
        setSelectedActividad(actividadActual || null);
        setSelectedMes(mesActual || null);
        setCalendarizacionDialog(true);
    };

    const confirmDeleteCalendarizacion = (calendarizacion: Calendarizacion) => {
        setCalendarizacion(calendarizacion);
        setDeleteCalendarizacionDialog(true);
    };

    const deleteCalendarizacion = () => {
        const _calendarizaciones = calendarizaciones.filter((val) => val.idCalendarizacion !== calendarizacion.idCalendarizacion);
        CalendarizacionService.delete(calendarizacion.idCalendarizacion);
        setCalendarizaciones(_calendarizaciones);
        setDeleteCalendarizacionDialog(false);
        setCalendarizacion(emptyCalendarizacion);
        toast.current?.show({
            severity: 'success',
            summary: 'Resultado',
            detail: 'Registro Eliminado',
            life: 3000
        });
    };

    const findIndexById = (idCalendarizacion: number) => {
        let index = -1;
        for (let i = 0; i < calendarizaciones.length; i++) {
            if (calendarizaciones[i].idCalendarizacion === idCalendarizacion) {
                index = i;
                break;
            }
        }
        return index;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onActividadChange = (e: DropdownChangeEvent) => {
        const _calendarizacion = {...calendarizacion};
        const xactividad: Actividad = e.target.value;
        setSelectedActividad(xactividad);
        _calendarizacion.actividad = xactividad;
        setCalendarizacion(_calendarizacion);
    };

    const onMesChange = (e: DropdownChangeEvent) => {
        const _calendarizacion = {...calendarizacion};
        const xmes: Mes = e.target.value;
        setSelectedMes(xmes);
        _calendarizacion.mes = xmes;
        setCalendarizacion(_calendarizacion);
    };

    const onPresupuestoChange = (e: any) => {
        const val = e.value || 0;
        const _calendarizacion = {...calendarizacion};
        _calendarizacion.presupuesto = val;
        setCalendarizacion(_calendarizacion);
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

    const actionBodyTemplate = (rowData: Calendarizacion) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editCalendarizacion(rowData)}/>
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteCalendarizacion(rowData)}/>
            </React.Fragment>
        );
    };

    const mesBodyTemplate = (rowData: Calendarizacion) => {
        return rowData.mes ? rowData.mes.nombreMes : '';
    };

    const actividadBodyTemplate = (rowData: Calendarizacion) => {
        return rowData.actividad ? `${rowData.actividad.noActividad} - ${rowData.actividad.nombreActividad}` : '';
    };

    const mesOptionTemplate = (option: Mes) => {
        return (
            <div className="flex align-items-center">
                <div>{option.nombreMes}</div>
            </div>
        );
    };

    const actividadOptionTemplate = (option: Actividad) => {
        return (
            <div className="flex align-items-center">
                <div>{option.noActividad} - {option.nombreActividad}</div>
            </div>
        );
    };

    const presupuestoBodyTemplate = (rowData: Calendarizacion) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(rowData.presupuesto);
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Calendarización</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" placeholder="Buscar..." onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    setGlobalFilter(target.value);
                }}/>
            </IconField>
        </div>
    );

    const calendarizacionDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveCalendarizacion} />
        </React.Fragment>
    );

    const deleteCalendarizacionDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteCalendarizacionDialog} />
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteCalendarizacion} />
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <DataTable ref={dt} value={calendarizaciones} dataKey="idCalendarizacion" paginator rows={10}
                           rowsPerPageOptions={[5, 10, 25]} paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                           currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} calendarizaciones"
                           globalFilter={globalFilter} header={header}>
                    <Column field="actividad" header="Actividad" body={actividadBodyTemplate} sortable style={{ minWidth: '20rem' }}></Column>
                    <Column field="mes" header="Mes" body={mesBodyTemplate} sortable style={{ minWidth: '10rem' }}></Column>
                    <Column field="presupuesto" header="Presupuesto" body={presupuestoBodyTemplate} sortable style={{ minWidth: '10rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={calendarizacionDialog} style={{ width: '40rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                    header="Detalles de Calendarización" modal className="p-fluid" footer={calendarizacionDialogFooter} onHide={hideDialog}>

                <div className="field">
                    <label className="font-bold block mb-2">Actividad: {
                        selectedActividad ? `${selectedActividad.noActividad} - ${selectedActividad.nombreActividad}` : ''
                    }</label>
                    <Dropdown
                        value={selectedActividad}
                        onChange={onActividadChange}
                        options={actividades}
                        optionLabel="nombreActividad"
                        itemTemplate={actividadOptionTemplate}
                        valueTemplate={selectedActividad ? actividadOptionTemplate : undefined}
                        placeholder="Seleccionar una actividad"
                        className={classNames("w-full", { 'p-invalid': submitted && !selectedActividad })}
                    />
                    {submitted && !selectedActividad && <small className="p-error">Actividad requerida.</small>}
                </div>

                <div className="field">
                    <label className="font-bold block mb-2">Mes: {
                        selectedMes ? selectedMes.nombreMes : ''
                    }</label>
                    <Dropdown
                        value={selectedMes}
                        onChange={onMesChange}
                        options={meses}
                        optionLabel="nombreMes"
                        itemTemplate={mesOptionTemplate}
                        valueTemplate={selectedMes ? mesOptionTemplate : undefined}
                        placeholder="Seleccionar un mes"
                        className={classNames("w-full", { 'p-invalid': submitted && !selectedMes })}
                    />
                    {submitted && !selectedMes && <small className="p-error">Mes requerido.</small>}
                </div>

                <div className="field">
                    <label htmlFor="presupuesto" className="font-bold">
                        Presupuesto
                    </label>
                    <InputNumber
                        id="presupuesto"
                        value={calendarizacion.presupuesto}
                        onValueChange={onPresupuestoChange}
                        mode="currency"
                        currency="MXN"
                        locale="es-MX"
                        className={classNames({ 'p-invalid': submitted && calendarizacion.presupuesto <= 0 })}
                    />
                    {submitted && calendarizacion.presupuesto <= 0 && <small className="p-error">Presupuesto requerido.</small>}
                </div>
            </Dialog>

            <Dialog visible={deleteCalendarizacionDialog} style={{ width: '32rem' }}
                    breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                    header="Confirmar" modal footer={deleteCalendarizacionDialogFooter} onHide={hideDeleteCalendarizacionDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {calendarizacion && <span>¿Estás seguro de eliminar esta calendarización para la actividad <b>{calendarizacion.actividad?.nombreActividad}</b> en el mes de <b>{calendarizacion.mes ? calendarizacion.mes.nombreMes : ''}</b>?</span>}
                </div>
            </Dialog>
        </div>
    );
}