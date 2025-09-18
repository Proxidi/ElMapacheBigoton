import React, {useState, useEffect, useRef} from 'react';
import {Toast} from "primereact/toast";
import {DataTable} from "primereact/datatable";
import ObjetivoService from "../../services/ObjetivoService.tsx";
import {Button} from "primereact/button";
import {IconField} from "primereact/iconfield";
import {InputIcon} from "primereact/inputicon";
import {InputText} from "primereact/inputtext";
import {Toolbar} from "primereact/toolbar";
import {Column} from "primereact/column";
import {classNames} from "primereact/utils";
import {Dialog} from "primereact/dialog";

interface Objetivo {
    idObjetivo: number;
    nombreObjetivo: string;
    estrategia: string;
    defEstrategia: string;
}

export default function CRUDObjetivoComponent() {
    const emptyObjetivo: Objetivo = {
        idObjetivo: 0,
        nombreObjetivo: '',
        estrategia: '',
        defEstrategia: '',
    };

    const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
    const [objetivo, setObjetivo] = useState<Objetivo>(emptyObjetivo);
    const [objetivoDialog, setObjetivoDialog] = useState<boolean>(false);
    const [deleteObjetivoDialog, setDeleteObjetivoDialog] = useState<boolean>(false);
    const [submited, setSubmited] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Objetivo[]>>(null);

    useEffect(() => {
        ObjetivoService.findAll().then((response) => setObjetivos(response.data));
    }, []);

    const openNew = () => {
        setObjetivo(emptyObjetivo);
        setSubmited(false);
        setObjetivoDialog(true);
    };

    const hideDialog = () => {
        setSubmited(false);
        setObjetivoDialog(false);
    };

    const hideDeleteObjetivoDialog = () => {
        setDeleteObjetivoDialog(false);
    };

    const saveObjetivo = async () => {
        setSubmited(true);
        if (objetivo.nombreObjetivo.trim() && objetivo.estrategia.trim() && objetivo.defEstrategia.trim()) {
            const _objetivos = [...objetivos];
            const _objetivo = {...objetivo};

            if (objetivo.idObjetivo) {
                ObjetivoService.update(objetivo.idObjetivo, objetivo);
                const index = findIndexById(objetivo.idObjetivo);
                _objetivos[index] = _objetivo;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Registro Actualizado',
                    life: 3000
                });
            } else {
                _objetivo.idObjetivo = await getIdObjetivo(_objetivo);
                _objetivos.push(_objetivo);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Registro Creado',
                    life: 3000
                });
            }
            setObjetivos(_objetivos);
            setObjetivoDialog(false);
            setObjetivo(emptyObjetivo);
        }
    };

    const getIdObjetivo = async (_objetivo: Objetivo) => {
        let idObjetivo = 0;
        const newObjetivo = {
            nombreObjetivo: _objetivo.nombreObjetivo,
            estrategia: _objetivo.estrategia,
            defEstrategia: _objetivo.defEstrategia
        };
        await ObjetivoService.create(newObjetivo).then((response) => {
            idObjetivo = response.data.idObjetivo;
        }).catch(error => {
            console.log(error);
        });
        return idObjetivo;
    };

    const editObjetivo = (objetivo: Objetivo) => {
        setObjetivo({...objetivo});
        setObjetivoDialog(true);
    };

    const confirmDeleteObjetivo = (objetivo: Objetivo) => {
        setObjetivo(objetivo);
        setDeleteObjetivoDialog(true);
    };

    const deleteObjetivo = () => {
        const _objetivos = objetivos.filter((val) => val.idObjetivo !== objetivo.idObjetivo);
        ObjetivoService.delete(objetivo.idObjetivo);
        setObjetivos(_objetivos);
        setDeleteObjetivoDialog(false);
        setObjetivo(emptyObjetivo);
        toast.current?.show({
            severity: 'success',
            summary: 'Resultado',
            detail: 'Registro Eliminado',
            life: 3000
        });
    };

    /*
    const findIndexById = (idObjetivo: number) => {
        let index = -1;
        for (let i = 0; i < objetivos.length; i++) {
            if (objetivos[i].idObjetivo === idObjetivo) {
                index = i;
                break;
            }
        }
        return index;
    };
     */

    const findIndexById = (id: number) => {
        return objetivos.findIndex(o => o.idObjetivo === id);
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onNombreObjetivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _objetivo = {...objetivo};
        _objetivo.nombreObjetivo = val;
        setObjetivo(_objetivo);
    };

    const onEstrategiaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _objetivo = {...objetivo};
        _objetivo.estrategia = val;
        setObjetivo(_objetivo);
    };

    const onDefEstrategiaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _objetivo = {...objetivo};
        _objetivo.defEstrategia = val;
        setObjetivo(_objetivo);
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

    const actionBodyTemplate = (rowData: Objetivo) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editObjetivo(rowData)}/>
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteObjetivo(rowData)}/>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Objetivos PIID</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search"/>
                <InputText type="search" placeholder="Buscar..." onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    setGlobalFilter(target.value);
                }}/>
            </IconField>
        </div>
    );

    const objetivoDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog}/>
            <Button label="Guardar" icon="pi pi-check" onClick={saveObjetivo}/>
        </React.Fragment>
    );

    const deleteObjetivoDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteObjetivoDialog}/>
            <Button label="Si" icon="pi pi-check" severity="danger" onClick={deleteObjetivo}/>
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast}/>
            <div className="Card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <DataTable ref={dt} value={objetivos} dataKey="idObjetivo" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                           paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                           currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} objetivos PIID"
                           globalFilter={globalFilter} header={header}>
                    <Column field="idObjetivo" header="ID" sortable style={{minWidth: '5rem'}}></Column>
                    <Column field="nombreObjetivo" header="Nombre del objetivo" sortable style={{minWidth: '10rem'}}></Column>
                    <Column field="estrategia" header="Estrategia" sortable style={{minWidth: '10rem'}}></Column>
                    <Column field="defEstrategia" header="Definición de estrategia" sortable style={{minWidth: '10rem'}}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem'}}></Column>
                </DataTable>
            </div>
            <Dialog visible={objetivoDialog} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}} header="Detalles de objetivo" modal className="p-fluid" footer={objetivoDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="nombreObjetivo" className="font-bold">Nombre del objetivo PIID</label>
                    <InputText id="nombreObjetivo" value={objetivo.nombreObjetivo} onChange={(e) => onNombreObjetivoChange(e)} required autoFocus className={classNames({'p-invalid': submited && !objetivo.nombreObjetivo})}/>
                    {submited && !objetivo.nombreObjetivo && <small className="p-error">El nombre del objetivo es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="estrategia" className="font-bold">Estrategia</label>
                    <InputText id="estrategia" value={objetivo.estrategia} onChange={(e) => onEstrategiaChange(e)} required autoFocus className={classNames({'p-invalid': submited && !objetivo.estrategia})}/>
                    {submited && !objetivo.estrategia && <small className="p-error">La estrategia es requerida.</small>}
                </div>
                <div className="field">
                    <label htmlFor="defEstrategia" className="font-bold">Definición de la estrategia</label>
                    <InputText id="defEstrategia" value={objetivo.defEstrategia} onChange={(e) => onDefEstrategiaChange(e)} required autoFocus className={classNames({'p-invalid': submited && !objetivo.defEstrategia})}/>
                    {submited && !objetivo.defEstrategia && <small className="p-error">La definición de la estrategia es requerida.</small>}
                </div>
            </Dialog>
            <Dialog visible={deleteObjetivoDialog} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}} header="Confirmar" modal footer={deleteObjetivoDialogFooter} onHide={hideDeleteObjetivoDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{fontSize: '2rem'}}/>
                    {objetivo && (
                        <span>
                            ¿Estás seguro de eliminar a <b>{objetivo.nombreObjetivo}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );

}