import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import MesService from '../../services/MesService';
import { Button } from 'primereact/button';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { Column } from 'primereact/column';
import { classNames } from 'primereact/utils';
import { Dialog } from 'primereact/dialog';

interface Mes {
    idMes: number;
    nombreMes: string;
}

export default function CRUDMesComponent() {
    const emptyMes: Mes = {
        idMes: 0,
        nombreMes: '',
    };

    const [meses, setMeses] = useState<Mes[]>([]);
    const [mes, setMes] = useState<Mes>(emptyMes);
    const [mesDialog, setMesDialog] = useState<boolean>(false);
    const [deleteMesDialog, setDeleteMesDialog] = useState<boolean>(false);
    const [submited, setSubmited] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Mes[]>>(null);

    useEffect(() => {
        MesService.findAll().then((response) => setMeses(response.data));
    }, []);

    const openNew = () => {
        setMes(emptyMes);
        setSubmited(false);
        setMesDialog(true);
    };

    const hideDialog = () => {
        setSubmited(false);
        setMesDialog(false);
    };

    const hideDeleteMesDialog = () => {
        setDeleteMesDialog(false);
    };

    const saveMes = async () => {
        setSubmited(true);
        if (mes.nombreMes.trim()) {
            const _meses = [...meses];
            const _mes = { ...mes };

            if (mes.idMes) {
                MesService.update(mes.idMes, mes);
                const index = findIndexById(mes.idMes);
                _meses[index] = _mes;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Registro Actualizado',
                    life: 3000
                });
            } else {
                _mes.idMes = await getIdMes(_mes);
                _meses.push(_mes);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Registro Creado',
                    life: 3000
                });
            }
            setMeses(_meses);
            setMesDialog(false);
            setMes(emptyMes);
        }
    };

    const getIdMes = async (_mes: Mes) => {
        let idMes = 0;
        const newMes = {
            nombre: _mes.nombreMes,
        };
        await MesService.create(newMes).then((response) => {
            idMes = response.data.idMes;
        }).catch(error => {
            console.log(error);
        });
        return idMes;
    };

    const editMes = (mes: Mes) => {
        setMes({ ...mes });
        setMesDialog(true);
    };

    const confirmDeleteMes = (mes: Mes) => {
        setMes(mes);
        setDeleteMesDialog(true);
    };

    const deleteMes = () => {
        const _meses = meses.filter((val) => val.idMes !== mes.idMes);
        MesService.delete(mes.idMes);
        setMeses(_meses);
        setDeleteMesDialog(false);
        setMes(emptyMes);
        toast.current?.show({
            severity: 'success',
            summary: 'Resultado',
            detail: 'Registro Eliminado',
            life: 3000
        });
    };

    const findIndexById = (id: number) => {
        return meses.findIndex(o => o.idMes === id);
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _mes = { ...mes };
        _mes.nombreMes = val;
        setMes(_mes);
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Exportar" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />;
    };

    const actionBodyTemplate = (rowData: Mes) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editMes(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteMes(rowData)} />
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Meses</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText
                    type="search"
                    placeholder="Buscar..."
                    onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        setGlobalFilter(target.value);
                    }}
                />
            </IconField>
        </div>
    );

    const mesDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveMes} />
        </React.Fragment>
    );

    const deleteMesDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteMesDialog} />
            <Button label="Si" icon="pi pi-check" severity="danger" onClick={deleteMes} />
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="Card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <DataTable
                    ref={dt}
                    value={meses}
                    dataKey="idMes"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} meses"
                    globalFilter={globalFilter}
                    header={header}
                >
                    <Column field="idMes" header="ID" sortable style={{ minWidth: '5rem' }}></Column>
                    <Column field="nombre" header="Mes" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog
                visible={mesDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Detalles de Mes"
                modal
                className="p-fluid"
                footer={mesDialogFooter}
                onHide={hideDialog}
            >
                <div className="field">
                    <label htmlFor="nombreMes" className="font-bold">
                        Mes
                    </label>
                    <InputText id="nombreMes" value={mes.nombreMes} onChange={(e) => onNombreChange(e)}
                               required autoFocus className={classNames({'p-invalid': submited && !mes.nombreMes})}/>
                    {submited && !mes.nombreMes && <small className="p-error">El nombre del mes es requerido.</small>}
                </div>
            </Dialog>

            <Dialog
                visible={deleteMesDialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Confirmar"
                modal
                footer={deleteMesDialogFooter}
                onHide={hideDeleteMesDialog}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {mes && (
                        <span>
                            ¿Estás seguro de eliminar el mes <b>{mes.nombreMes}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}