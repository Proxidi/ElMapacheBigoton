import React, { useState, useEffect, useRef } from 'react';
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import AreaService from "../../services/AreaService";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Toolbar } from "primereact/toolbar";
import { Column } from "primereact/column";
import { classNames } from "primereact/utils";
import { Dialog } from "primereact/dialog";

interface Area {
    idArea: number;
    nombreArea: string;
}

export default function CRUDAreaComponent() {
    const emptyArea: Area = {
        idArea: 0,
        nombreArea: '',
    };

    const [areas, setAreas] = useState<Area[]>([]);
    const [area, setArea] = useState<Area>(emptyArea);
    const [areaDialog, setAreaDialog] = useState<boolean>(false);
    const [deleteAreaDialog, setDeleteAreaDialog] = useState<boolean>(false);
    const [submited, setSubmited] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Area[]>>(null);

    useEffect(() => {
        AreaService.findAll().then((response) => setAreas(response.data));
    }, []);

    const openNew = () => {
        setArea(emptyArea);
        setSubmited(false);
        setAreaDialog(true);
    };

    const hideDialog = () => {
        setSubmited(false);
        setAreaDialog(false);
    };

    const hideDeleteAreaDialog = () => {
        setDeleteAreaDialog(false);
    };

    const saveArea = async () => {
        setSubmited(true);
        if (area.nombreArea.trim()) {
            const _areas = [...areas];
            const _area = { ...area };

            if (area.idArea) {
                AreaService.update(area.idArea, area);
                const index = findIndexById(area.idArea);
                _areas[index] = _area;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Área Actualizada',
                    life: 3000
                });
            } else {
                _area.idArea = await getIdArea(_area);
                _areas.push(_area);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Área Creada',
                    life: 3000
                });
            }
            setAreas(_areas);
            setAreaDialog(false);
            setArea(emptyArea);
        }
    };

    const getIdArea = async (_area: Area) => {
        let idArea = 0;
        const newArea = {
            nombreArea: _area.nombreArea
        };
        await AreaService.create(newArea).then((response) => {
            idArea = response.data.idArea;
        }).catch(error => {
            console.log(error);
        });
        return idArea;
    };

    const editArea = (area: Area) => {
        setArea({ ...area });
        setAreaDialog(true);
    };

    const confirmDeleteArea = (area: Area) => {
        setArea(area);
        setDeleteAreaDialog(true);
    };

    const deleteArea = () => {
        const _areas = areas.filter((val) => val.idArea !== area.idArea);
        AreaService.delete(area.idArea);
        setAreas(_areas);
        setDeleteAreaDialog(false);
        setArea(emptyArea);
        toast.current?.show({
            severity: 'success',
            summary: 'Resultado',
            detail: 'Área Eliminada',
            life: 3000
        });
    };

    const findIndexById = (idArea: number) => {
        let index = -1;
        for (let i = 0; i < areas.length; i++) {
            if (areas[i].idArea === idArea) {
                index = i;
                break;
            }
        }
        return index;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onNombreAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _area = { ...area };
        _area.nombreArea = val;
        setArea(_area);
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

    const actionBodyTemplate = (rowData: Area) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editArea(rowData)}/>
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteArea(rowData)}/>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Áreas</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search"/>
                <InputText type="search" placeholder="Buscar..." onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    setGlobalFilter(target.value);
                }}/>
            </IconField>
        </div>
    );

    const areaDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog}/>
            <Button label="Guardar" icon="pi pi-check" onClick={saveArea}/>
        </React.Fragment>
    );

    const deleteAreaDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteAreaDialog}/>
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteArea}/>
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast}/>
            <div className="Card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <DataTable ref={dt} value={areas} dataKey="idArea" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                           paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                           currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} áreas"
                           globalFilter={globalFilter} header={header}>
                    <Column field="idArea" header="ID" sortable style={{minWidth: '5rem'}}></Column>
                    <Column field="nombreArea" header="Nombre Área" sortable style={{minWidth: '20rem'}}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem'}}></Column>
                </DataTable>
            </div>

            <Dialog visible={areaDialog} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}}
                    header="Detalles de Área" modal className="p-fluid" footer={areaDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="nombreArea" className="font-bold">
                        Nombre del área
                    </label>
                    <InputText id="nombreArea" value={area.nombreArea} onChange={(e) => onNombreAreaChange(e)}
                               required autoFocus className={classNames({'p-invalid': submited && !area.nombreArea})}/>
                    {submited && !area.nombreArea && <small className="p-error">El nombre del área es requerido.</small>}
                </div>
            </Dialog>

            <Dialog visible={deleteAreaDialog} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}}
                    header="Confirmar" modal footer={deleteAreaDialogFooter} onHide={hideDeleteAreaDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{fontSize: '2rem'}}/>
                    {area && (
                        <span>
                            ¿Estás seguro de eliminar el área <b>{area.nombreArea}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}