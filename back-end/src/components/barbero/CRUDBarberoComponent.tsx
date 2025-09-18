import React, { useState, useEffect, useRef } from 'react';
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import BarberoService from "../../services/BarberoService";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Toolbar } from "primereact/toolbar";
import { Column } from "primereact/column";
import { classNames } from "primereact/utils";
import { Dialog } from "primereact/dialog";

interface Barbero {
    idBarbero: number;
    nombreBarbero: string;
}

export default function CRUDBarberoComponent() {
    const emptyBarbero: Barbero = {
        idBarbero: 0,
        nombreBarbero: '',
    };

    const [barberos, setBarberos] = useState<Barbero[]>([]);
    const [barbero, setBarbero] = useState<Barbero>(emptyBarbero);
    const [barberoDialog, setBarberoDialog] = useState<boolean>(false);
    const [deleteBarberoDialog, setDeleteBarberoDialog] = useState<boolean>(false);
    const [submited, setSubmited] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Barbero[]>>(null);

    useEffect(() => {
        BarberoService.findAll().then((response) => setBarberos(response.data));
    }, []);

    const openNew = () => {
        setBarbero(emptyBarbero);
        setSubmited(false);
        setBarberoDialog(true);
    };

    const hideDialog = () => {
        setSubmited(false);
        setBarberoDialog(false);
    };

    const hideDeleteBarberoDialog = () => {
        setDeleteBarberoDialog(false);
    };

    const saveBarbero = async () => {
        setSubmited(true);
        if (barbero.nombreBarbero.trim()) {
            const _barberos = [...barberos];
            const _barbero = { ...barbero };

            if (barbero.idBarbero) {
                BarberoService.update(barbero.idbarbero, barbero);
                const index = findIndexById(barbero.idBarbero);
                _barberos[index] = _barbero;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Barbero Actualizado',
                    life: 3000
                });
            } else {
                _barbero.idBarbero = await getIdBarbero(_barbero);
                _barberos.push(_barbero);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Barbero Creado',
                    life: 3000
                });
            }
            setBarberos(_barberos);
            setBarberoDialog(false);
            setBarbero(emptyBarbero);
        }
    };

    const getIdBarbero = async (_barbero: Barbero) => {
        let idBarbero = 0;
        const newBarbero = {
            nombreBarbero: _barbero.nombreBarbero
        };
        await BarberoService.create(newBarbero).then((response) => {
            idBarbero = response.data.idBarbero;
        }).catch(error => {
            console.log(error);
        });
        return idBarbero;
    };

    const editBarbero = (barbero: Barbero) => {
        setBarbero({ ...barbero });
        setBarberoDialog(true);
    };

    const confirmDeleteBarbero = (barbero: Barbero) => {
        setBarbero(barbero);
        setDeleteBarberoDialog(true);
    };

    const deleteBarbero = () => {
        const _barberos = barberos.filter((val) => val.idBarbero !== barbero.idBarbero);
        BarberoService.delete(barbero.idBarbero);
        setBarberos(_barberos);
        setDeleteBarberoDialog(false);
        setBarbero(emptyBarbero);
        toast.current?.show({
            severity: 'success',
            summary: 'Resultado',
            detail: 'Barbero Eliminado',
            life: 3000
        });
    };

    const findIndexById = (idBarbero: number) => {
        let index = -1;
        for (let i = 0; i < barberos.length; i++) {
            if (barberos[i].idBarbero === idBarbero) {
                index = i;
                break;
            }
        }
        return index;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onNombreBarberoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _barbero = { ...barbero };
        _barbero.nombreBarbero = val;
        setBarbero(_barbero);
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

    const actionBodyTemplate = (rowData: Barbero) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editBarbero(rowData)}/>
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteBarbero(rowData)}/>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Barberos</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search"/>
                <InputText type="search" placeholder="Buscar..." onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    setGlobalFilter(target.value);
                }}/>
            </IconField>
        </div>
    );

    const barberoDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog}/>
            <Button label="Guardar" icon="pi pi-check" onClick={saveBarbero}/>
        </React.Fragment>
    );

    const deletebarberoDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteBarberoDialog}/>
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteBarbero}/>
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast}/>
            <div className="Card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <DataTable ref={dt} value={barberos} dataKey="idBarbero" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                           paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                           currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} barberos"
                           globalFilter={globalFilter} header={header}>
                    <Column field="idBarbero" header="ID" sortable style={{minWidth: '5rem'}}></Column>
                    <Column field="nombreBarbero" header="Nombre de Barbero" sortable style={{minWidth: '20rem'}}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem'}}></Column>
                </DataTable>
            </div>

            <Dialog visible={barberoDialog} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}}
                    header="Detalles del Barbero" modal className="p-fluid" footer={barberoDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="nombreBarbero" className="font-bold">
                        Nombre del Barbero
                    </label>
                    <InputText id="nombreBarbero" value={barbero.nombreBarbero} onChange={(e) => onNombreBarberoChange(e)}
                               required autoFocus className={classNames({'p-invalid': submited && !barbero.nombreBarbero})}/>
                    {submited && !barbero.nombreBarbero && <small className="p-error">El nombre del barbero es requerido.</small>}
                </div>
            </Dialog>

            <Dialog visible={deleteBarberoDialog} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}}
                    header="Confirmar" modal footer={deleteBarberoDialogFooter} onHide={hideDeleteBarberoDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{fontSize: '2rem'}}/>
                    {barbero && (
                        <span>
                            ¿Estás seguro de eliminar al barbero <b>{barbero.nombreBarbero}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}