import React, { useState, useEffect, useRef } from 'react';
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import ComponenteService from "../../services/ComponenteService";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Toolbar } from "primereact/toolbar";
import { Column } from "primereact/column";
import { classNames } from "primereact/utils";
import { Dialog } from "primereact/dialog";

interface Componente {
    idComponente: number;
    nombreComponente: string;
    nivel: string;
    indicador: string;
}

export default function CRUDComponenteComponent() {
    const emptyComponente: Componente = {
        idComponente: 0,
        nombreComponente: '',
        nivel: '',
        indicador: ''
    };

    const [componentes, setComponentes] = useState<Componente[]>([]);
    const [componente, setComponente] = useState<Componente>(emptyComponente);
    const [componenteDialog, setComponenteDialog] = useState<boolean>(false);
    const [deleteComponenteDialog, setDeleteComponenteDialog] = useState<boolean>(false);
    const [submited, setSubmited] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Componente[]>>(null);

    useEffect(() => {
        ComponenteService.findAll().then((response) => setComponentes(response.data));
    }, []);

    const openNew = () => {
        setComponente(emptyComponente);
        setSubmited(false);
        setComponenteDialog(true);
    };

    const hideDialog = () => {
        setSubmited(false);
        setComponenteDialog(false);
    };

    const hideDeleteComponenteDialog = () => {
        setDeleteComponenteDialog(false);
    };

    const saveComponente = async () => {
        setSubmited(true);
        if (componente.nombreComponente.trim() && componente.nivel.trim() && componente.indicador.trim()) {
            const _componentes = [...componentes];
            const _componente = { ...componente };

            if (componente.idComponente) {
                ComponenteService.update(componente.idComponente, componente);
                const index = findIndexById(componente.idComponente);
                _componentes[index] = _componente;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Componente Actualizado',
                    life: 3000
                });
            } else {
                _componente.idComponente = await getIdComponente(_componente);
                _componentes.push(_componente);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Componente Creado',
                    life: 3000
                });
            }
            setComponentes(_componentes);
            setComponenteDialog(false);
            setComponente(emptyComponente);
        }
    };

    const getIdComponente = async (_componente: Componente) => {
        let idComponente = 0;
        const newComponente = {
            nombreComponente: _componente.nombreComponente,
            nivel: _componente.nivel,
            indicador: _componente.indicador
        };
        await ComponenteService.create(newComponente).then((response) => {
            idComponente = response.data.idComponente;
        }).catch(error => {
            console.log(error);
        });
        return idComponente;
    };

    const editComponente = (componente: Componente) => {
        setComponente({ ...componente });
        setComponenteDialog(true);
    };

    const confirmDeleteComponente = (componente: Componente) => {
        setComponente(componente);
        setDeleteComponenteDialog(true);
    };

    const deleteComponente = () => {
        const _componentes = componentes.filter((val) => val.idComponente !== componente.idComponente);
        ComponenteService.delete(componente.idComponente);
        setComponentes(_componentes);
        setDeleteComponenteDialog(false);
        setComponente(emptyComponente);
        toast.current?.show({
            severity: 'success',
            summary: 'Resultado',
            detail: 'Componente Eliminado',
            life: 3000
        });
    };

    const findIndexById = (id: number) => {
        return componentes.findIndex(o => o.idComponente=== id);
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onNombreComponenteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _componente = { ...componente };
        _componente.nombreComponente = val;
        setComponente(_componente);
    };

    const onNivelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _componente = { ...componente };
        _componente.nivel = val;
        setComponente(_componente);
    };

    const onIndicadorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _componente = { ...componente };
        _componente.indicador = val;
        setComponente(_componente);
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew}/>
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Exportar" icon="pi pi-upload" className="p-button-help" onClick={exportCSV}/>;
    };

    const actionBodyTemplate = (rowData: Componente) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editComponente(rowData)}/>
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteComponente(rowData)}/>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Componentes</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search"/>
                <InputText type="search" placeholder="Buscar..." onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    setGlobalFilter(target.value);
                }}/>
            </IconField>
        </div>
    );

    const componenteDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog}/>
            <Button label="Guardar" icon="pi pi-check" onClick={saveComponente}/>
        </React.Fragment>
    );

    const deleteComponenteDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteComponenteDialog}/>
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteComponente}/>
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast}/>
            <div className="Card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <DataTable ref={dt} value={componentes} dataKey="idComponente" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                           paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                           currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} componentes"
                           globalFilter={globalFilter} header={header}>
                    <Column field="idComponente" header="ID" sortable style={{minWidth: '5rem'}}></Column>
                    <Column field="nombreComponente" header="Nombre" sortable style={{minWidth: '15rem'}}></Column>
                    <Column field="nivel" header="Nivel" sortable style={{minWidth: '10rem'}}></Column>
                    <Column field="indicador" header="Indicador" sortable style={{minWidth: '25rem'}}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem'}}></Column>
                </DataTable>
            </div>

            <Dialog visible={componenteDialog} style={{width: '40rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}}
                    header="Detalles del Componente" modal className="p-fluid" footer={componenteDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="nombreComponente" className="font-bold">
                        Nombre Componente
                    </label>
                    <InputText id="nombreComponente" value={componente.nombreComponente}
                               onChange={(e) => onNombreComponenteChange(e)} required
                               className={classNames({'p-invalid': submited && !componente.nombreComponente})}/>
                    {submited && !componente.nombreComponente && <small className="p-error">Nombre requerido.</small>}
                </div>

                <div className="field">
                    <label htmlFor="nivel" className="font-bold">
                        Nivel
                    </label>
                    <InputText id="nivel" value={componente.nivel}
                               onChange={(e) => onNivelChange(e)} required
                               className={classNames({'p-invalid': submited && !componente.nivel})}/>
                    {submited && !componente.nivel && <small className="p-error">Nivel requerido.</small>}
                </div>

                <div className="field">
                    <label htmlFor="indicador" className="font-bold">
                        Indicador
                    </label>
                    <InputText id="indicador" value={componente.indicador}
                               onChange={(e) => onIndicadorChange(e)} required
                               className={classNames({'p-invalid': submited && !componente.indicador})}/>
                    {submited && !componente.indicador && <small className="p-error">Indicador requerido.</small>}
                </div>
            </Dialog>

            <Dialog visible={deleteComponenteDialog} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}}
                    header="Confirmar" modal footer={deleteComponenteDialogFooter} onHide={hideDeleteComponenteDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{fontSize: '2rem'}}/>
                    {componente && (
                        <span>
                            ¿Estás seguro de eliminar el componente <b>{componente.nombreComponente}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}