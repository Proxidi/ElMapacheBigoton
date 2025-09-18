import React, { useState, useEffect, useRef } from 'react';
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import ServicioService from "../../services/ServicioService";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Toolbar } from "primereact/toolbar";
import { Column } from "primereact/column";
import { classNames } from "primereact/utils";
import { Dialog } from "primereact/dialog";

interface Servicio {
    idServicio: number;
    descServicio: string;
    costo: number;
}

export default function CRUDServicioComponent() {
    const emptyServicio: Servicio = {
        idServicio: 0,
        descServicio: '',
        costo: 0
    };

    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [servicio, setServicio] = useState<Servicio>(emptyServicio);
    const [servicioDialog, setServicioDialog] = useState(false);
    const [deleteServicioDialog, setDeleteServicioDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Servicio[]>>(null);

    useEffect(() => {
        ServicioService.findAll().then((response) => setServicios(response.data));
    }, []);

    const openNew = () => {
        setServicio(emptyServicio);
        setSubmitted(false);
        setServicioDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setServicioDialog(false);
    };

    const hideDeleteServicioDialog = () => {
        setDeleteServicioDialog(false);
    };

    const saveServicio = async () => {
        setSubmitted(true);

        if (servicio.descServicio.trim() && servicio.costo > 0) {
            const _servicios = [...servicios];
            const _servicio = { ...servicio };

            if (servicio.idServicio) {
                ServicioService.update(servicio.idServicio, servicio);
                const index = findIndexById(servicio.idServicio);
                _servicios[index] = _servicio;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Servicio actualizado',
                    life: 3000
                });
            } else {
                _servicio.idServicio = await getIdServicio(_servicio);
                _servicios.push(_servicio);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Servicio creado',
                    life: 3000
                });
            }

            setServicios(_servicios);
            setServicioDialog(false);
            setServicio(emptyServicio);
        }
    };

    const getIdServicio = async (_servicio: Servicio) => {
        let idServicio = 0;
        const newServicio = {
            descServicio: _servicio.descServicio,
            costo: _servicio.costo
        };
        await ServicioService.create(newServicio)
            .then((response) => {
                idServicio = response.data.idServicio;
            })
            .catch(error => console.log(error));
        return idServicio;
    };

    const editServicio = (servicio: Servicio) => {
        setServicio({ ...servicio });
        setServicioDialog(true);
    };

    const confirmDeleteServicio = (servicio: Servicio) => {
        setServicio(servicio);
        setDeleteServicioDialog(true);
    };

    const deleteServicio = () => {
        const _servicios = servicios.filter((val) => val.idServicio !== servicio.idServicio);
        ServicioService.delete(servicio.idServicio);
        setServicios(_servicios);
        setDeleteServicioDialog(false);
        setServicio(emptyServicio);
        toast.current?.show({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'Servicio eliminado',
            life: 3000
        });
    };

    const findIndexById = (idServicio: number) => {
        return servicios.findIndex((s) => s.idServicio === idServicio);
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: keyof Servicio) => {
        const val = (e.target && e.target.value) || '';
        setServicio({ ...servicio, [name]: name === 'costo' ? parseFloat(val) || 0 : val });
    };

    const leftToolbarTemplate = () => (
        <div className="flex flex-wrap gap-2">
            <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew} />
        </div>
    );

    const rightToolbarTemplate = () => (
        <Button label="Exportar" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
    );

    const actionBodyTemplate = (rowData: Servicio) => (
        <>
            <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editServicio(rowData)} />
            <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteServicio(rowData)} />
        </>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Servicios</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" placeholder="Buscar..." onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} />
            </IconField>
        </div>
    );

    const servicioDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveServicio} />
        </>
    );

    const deleteServicioDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteServicioDialog} />
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteServicio} />
        </>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="Card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />
                <DataTable
                    ref={dt}
                    value={servicios}
                    dataKey="idServicio"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} servicios"
                    globalFilter={globalFilter}
                    header={header}
                >
                    <Column field="idServicio" header="ID" sortable style={{ minWidth: '5rem' }} />
                    <Column field="descServicio" header="Descripción" sortable style={{ minWidth: '20rem' }} />
                    <Column field="costo" header="Costo" sortable style={{ minWidth: '10rem' }} />
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }} />
                </DataTable>
            </div>

            <Dialog visible={servicioDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Detalles del Servicio" modal className="p-fluid" footer={servicioDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="descServicio" className="font-bold">Descripción</label>
                    <InputText id="descServicio" value={servicio.descServicio}
                        onChange={(e) => onInputChange(e, 'descServicio')}
                        required autoFocus className={classNames({ 'p-invalid': submitted && !servicio.descServicio })} />
                    {submitted && !servicio.descServicio && <small className="p-error">La descripción es requerida.</small>}
                </div>
                <div className="field">
                    <label htmlFor="costo" className="font-bold">Costo</label>
                    <InputText id="costo" keyfilter="int" value={servicio.costo.toString()}
                        onChange={(e) => onInputChange(e, 'costo')}
                        required
                        className={classNames({ 'p-invalid': submitted && (!servicio.costo || servicio.costo <= 0) })}
                    />
                    {submitted && (!servicio.costo || servicio.costo <= 0) && <small className="p-error">El costo debe ser mayor a 0.</small>}
                </div>
            </Dialog>

            <Dialog visible={deleteServicioDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Confirmar" modal footer={deleteServicioDialogFooter} onHide={hideDeleteServicioDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {servicio && (
                        <span>
                            ¿Estás seguro de eliminar el servicio <b>{servicio.descServicio}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}

