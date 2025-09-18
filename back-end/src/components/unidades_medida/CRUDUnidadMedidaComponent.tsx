import React, {useState, useEffect, useRef} from 'react';
import {Toast} from "primereact/toast";
import {DataTable} from "primereact/datatable";
import UnidadMedidaService from "../../services/UnidadMedidaService.tsx";
import {Button} from "primereact/button";
import {IconField} from "primereact/iconfield";
import {InputIcon} from "primereact/inputicon";
import {InputText} from "primereact/inputtext";
import {Toolbar} from "primereact/toolbar";
import {Column} from "primereact/column";
import {classNames} from "primereact/utils";
import {Dialog} from "primereact/dialog";

interface UnidadMedida {
    idUnidadMedida: number;
    nombreUnidadMedida: string;
}

export default function CRUDUnidadMedidaComponent() {
    const emptyUnidadMedida: UnidadMedida = {
        idUnidadMedida: 0,
        nombreUnidadMedida: '',
    };

    const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);
    const [unidadMedida, setUnidadMedida] = useState<UnidadMedida>(emptyUnidadMedida);
    const [unidadMedidaDialog, setUnidadMedidaDialog] = useState<boolean>(false);
    const [deleteUnidadMedidaDialog, setDeleteUnidadMedidaDialog] = useState<boolean>(false);
    const [submited, setSubmited] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<UnidadMedida[]>>(null);

    useEffect(() => {
        UnidadMedidaService.findAll().then((response) => setUnidadesMedida(response.data));
    }, []);

    const openNew = () => {
        setUnidadMedida(emptyUnidadMedida);
        setSubmited(false);
        setUnidadMedidaDialog(true);
    };

    const hideDialog = () => {
        setSubmited(false);
        setUnidadMedidaDialog(false);
    };

    const hideDeleteUnidadMedidaDialog = () => {
        setDeleteUnidadMedidaDialog(false);
    };

    const saveUnidadMedida = async () => {
        setSubmited(true);
        if (unidadMedida.nombreUnidadMedida.trim() && unidadMedida.nombreUnidadMedida.trim()) {
            const _unidadesMedida = [...unidadesMedida];
            const _unidadMedida = {...unidadMedida};

            if (unidadMedida.idUnidadMedida) {
                UnidadMedidaService.update(unidadMedida.idUnidadMedida, unidadMedida);
                const index = findIndexById(unidadMedida.idUnidadMedida);
                _unidadesMedida[index] = _unidadMedida;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Registro Actualizado',
                    life: 3000
                });
            } else {
                _unidadMedida.idUnidadMedida = await getIdUnidadMedida(_unidadMedida);
                _unidadesMedida.push(_unidadMedida);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Registro Creado',
                    life: 3000
                });
            }
            setUnidadesMedida(_unidadesMedida);
            setUnidadMedidaDialog(false);
            setUnidadMedida(emptyUnidadMedida);
        }
    };

    const getIdUnidadMedida = async (_unidadMedida: UnidadMedida) => {
        let idUnidadMedida = 0;
        const newUnidadMedida = {
            nombreUnidadMedida: _unidadMedida.nombreUnidadMedida
        };
        await UnidadMedidaService.create(newUnidadMedida).then((response) => {
            idUnidadMedida = response.data.idUnidadMedida;
        }).catch(error => {
            console.log(error);
        });
        return idUnidadMedida;
    };

    const editUnidadMedida = (unidadMedida: UnidadMedida) => {
        setUnidadMedida({...unidadMedida});
        setUnidadMedidaDialog(true);
    };

    const confirmDeleteUnidadMedida = (unidadMedida: UnidadMedida) => {
        setUnidadMedida(unidadMedida);
        setDeleteUnidadMedidaDialog(true);
    };

    const deleteUnidadMedida = () => {
        const _unidadesMedida = unidadesMedida.filter((val) => val.idUnidadMedida !== unidadMedida.idUnidadMedida);
        UnidadMedidaService.delete(unidadMedida.idUnidadMedida);
        setUnidadesMedida(_unidadesMedida);
        setDeleteUnidadMedidaDialog(false);
        setUnidadMedida(emptyUnidadMedida);
        toast.current?.show({
            severity: 'success',
            summary: 'Resultado',
            detail: 'Registro Eliminado',
            life: 3000
        });
    };

    const findIndexById = (id: number) => {
        return unidadesMedida.findIndex(o => o.idUnidadMedida === id);
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onNombreUnidadMedidaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _unidadMedida = {...unidadMedida};
        _unidadMedida.nombreUnidadMedida = val;
        setUnidadMedida(_unidadMedida);
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

    const actionBodyTemplate = (rowData: UnidadMedida) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editUnidadMedida(rowData)}/>
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteUnidadMedida(rowData)}/>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Unidades de Medida</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search"/>
                <InputText type="search" placeholder="Buscar..." onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    setGlobalFilter(target.value);
                }}/>
            </IconField>
        </div>
    );

    const unidadMedidaDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog}/>
            <Button label="Guardar" icon="pi pi-check" onClick={saveUnidadMedida}/>
        </React.Fragment>
    );

    const deleteUnidadMedidaDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteUnidadMedidaDialog}/>
            <Button label="Si" icon="pi pi-check" severity="danger" onClick={deleteUnidadMedida}/>
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast}/>
            <div className="Card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <DataTable ref={dt} value={unidadesMedida} dataKey="idUnidadMedida" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                           paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                           currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} unidades de medida"
                           globalFilter={globalFilter} header={header}>
                    <Column field="idUnidadMedida" header="ID" sortable style={{minWidth: '5rem'}}></Column>
                    <Column field="nombreUnidadMedida" header="Nombre de la unidad de medida" sortable style={{minWidth: '10rem'}}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem'}}></Column>
                </DataTable>
            </div>
            <Dialog visible={unidadMedidaDialog} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}} header="Detalles de unidad de medida" modal className="p-fluid" footer={unidadMedidaDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="nombreUnidadMedida" className="font-bold">Nombre de la unidad de medida</label>
                    <InputText id="nombreUnidadMedida" value={unidadMedida.nombreUnidadMedida} onChange={(e) => onNombreUnidadMedidaChange(e)} required autoFocus className={classNames({'p-invalid': submited && !unidadMedida.nombreUnidadMedida})}/>
                    {submited && !unidadMedida.nombreUnidadMedida && <small className="p-error">El nombre de la unidad de medida es requerido.</small>}
                </div>
            </Dialog>
            <Dialog visible={deleteUnidadMedidaDialog} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}} header="Confirmar" modal footer={deleteUnidadMedidaDialogFooter} onHide={hideDeleteUnidadMedidaDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{fontSize: '2rem'}}/>
                    {unidadMedida && (
                        <span>
                            ¿Estás seguro de eliminar a <b>{unidadMedida.nombreUnidadMedida}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}