import React, {useState, useEffect, useRef} from 'react';
import {Toast} from "primereact/toast";
import {DataTable} from "primereact/datatable";
import ProgramaService from "../../services/ProgramaService.tsx";
import {Button} from "primereact/button";
import {IconField} from "primereact/iconfield";
import {InputIcon} from "primereact/inputicon";
import {InputText} from "primereact/inputtext";
import {Toolbar} from "primereact/toolbar";
import {Column} from "primereact/column";
import {classNames} from "primereact/utils";
import {Dialog} from "primereact/dialog";
import {Dropdown, DropdownChangeEvent} from "primereact/dropdown";
import UnidadService from "../../services/UnidadService.tsx";
import {InputNumber, InputNumberValueChangeEvent} from "primereact/inputnumber";

interface Unidad {
    idUnidad: number;
    nombreUnidad: string;
    email: string;
}

interface Programa {
    idPrograma: number;
    anio: number;
    unidadResponsable: string;
    jefeUnidad: string;
    objetivoArea: string;
    unidad: Unidad;
}

export default function CRUDProgramaComponent() {
    const emptyUnidad: Unidad = {
        idUnidad: 0,
        nombreUnidad: '',
        email: ''
    };

    const emptyPrograma: Programa = {
        idPrograma: 0,
        anio: 0,
        unidadResponsable: '',
        jefeUnidad: '',
        objetivoArea: '',
        unidad: emptyUnidad
    };

    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [programas, setProgramas] = useState<Programa[]>([]);
    const [programa, setPrograma] = useState<Programa>(emptyPrograma);
    const [programaDialog, setProgramaDialog] = useState<boolean>(false);
    const [deleteProgramaDialog, setDeleteProgramaDialog] = useState<boolean>(false);
    const [submited, setSubmited] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Programa[]>>(null);
    const [selectedUnidad, setSelectedUnidad] = useState<Unidad | null>(null);

    useEffect(() => {
        UnidadService.findAll().then((responseU) => setUnidades(responseU.data));
        ProgramaService.findAll().then((response) => setProgramas(response.data));
    }, []);

    const openNew = () => {
        setPrograma(emptyPrograma);
        setSubmited(false);
        setProgramaDialog(true);
    };

    const hideDialog = () => {
        setSubmited(false);
        setProgramaDialog(false);
    };

    const hideDeleteProgramaDialog = () => {
        setDeleteProgramaDialog(false);
    };

    const savePrograma = async () => {
        setSubmited(true);
        try{
            if (programa.unidadResponsable.trim() && programa.jefeUnidad.trim() && programa.objetivoArea.trim()) {
                const _programas = [...programas];
                const _programa = {...programa};

                if (programa.idPrograma) {
                    ProgramaService.update(programa.idPrograma, programa);
                    const index = findIndexById(programa.idPrograma);
                    _programas[index] = _programa;
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Registro Actualizado',
                        life: 3000
                    });
                } else {
                    _programa.idPrograma = await getIdPrograma(_programa);
                    _programas.push(_programa);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Registro Creado',
                        life: 3000
                    });
                }
                setProgramas(_programas);
                setProgramaDialog(false);
                setPrograma(emptyPrograma);
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Operación fallida',
                life: 3000
            });
        }
    };

    const getIdPrograma = async (_programa: Programa) => {
        let idPrograma = 0;
        const newPrograma= {
            anio: _programa.anio,
            unidadResponsable: _programa.unidadResponsable,
            jefeUnidad: _programa.jefeUnidad,
            objetivoArea: _programa.objetivoArea,
            unidad: _programa.unidad,
        };
        await ProgramaService.create(newPrograma).then((response) => {
            idPrograma = response.data.idPrograma;
        }).catch(error => {
            console.log(error);
        });
        return idPrograma;
    };

    const editPrograma = (programa: Programa) => {
        setPrograma({...programa});
        const unidadActual = unidades.find(u => u.idUnidad === programa.unidad.idUnidad);
        setSelectedUnidad(unidadActual || null);
        setProgramaDialog(true);
    };

    const confirmDeletePrograma = (programa: Programa) => {
        setPrograma(programa);
        setDeleteProgramaDialog(true);
    };

    const deletePrograma = () => {
        try {
            const _programas = programas.filter((val) => val.idPrograma !== programa.idPrograma);
            ProgramaService.delete(programa.idPrograma);
            setProgramas(_programas);
            setDeleteProgramaDialog(false);
            setPrograma(emptyPrograma);
            toast.current?.show({
                severity: 'success',
                summary: 'Resultado',
                detail: 'Registro Eliminado',
                life: 3000
            });
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar',
                life: 3000
            });
        }
    };

    const findIndexById = (idPrograma: number) => {
        let index = -1;
        for (let i = 0; i < programas.length; i++) {
            if (programas[i].idPrograma === idPrograma) {
                index = i;
                break;
            }
        }
        return index;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onAnioChange = (e: InputNumberValueChangeEvent) => {
        const val = e.value ?? 0;
        const _programa = {...programa};
        _programa.anio = val;
        setPrograma(_programa);
    };

    const onUnidadResponsableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _programa = {...programa};
        _programa.unidadResponsable = val;
        setPrograma(_programa);
    };

    const onJefeUnidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _programa = {...programa};
        _programa.jefeUnidad = val;
        setPrograma(_programa);
    };

    const onObjetivoAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _programa = {...programa};
        _programa.objetivoArea = val;
        setPrograma(_programa);
    };

    const onUnidadChange = (e: DropdownChangeEvent) => {
        const _programa = {...programa};
        const xunidad: Unidad = e.target.value;
        setSelectedUnidad(xunidad);
        _programa.unidad = xunidad;
        setPrograma(_programa);
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

    const actionBodyTemplate = (rowData: Programa) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editPrograma(rowData)}/>
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeletePrograma(rowData)}/>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Programas de TICs</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search"/>
                <InputText type="search" placeholder="Buscar..." onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    setGlobalFilter(target.value);
                }}/>
            </IconField>
        </div>
    );

    const programaDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog}/>
            <Button label="Guardar" icon="pi pi-check" onClick={savePrograma}/>
        </React.Fragment>
    );

    const deleteProgramaDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteProgramaDialog}/>
            <Button label="Si" icon="pi pi-check" severity="danger" onClick={deletePrograma}/>
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast}/>
            <div className="Card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <DataTable ref={dt} value={programas} dataKey="idPrograma" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                           paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                           currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} Programas de TICs"
                           globalFilter={globalFilter} header={header}>
                    <Column field="idPrograma" header="ID" sortable style={{minWidth: '5rem'}}></Column>
                    <Column field="anio" header="Año" sortable style={{minWidth: '10rem'}}></Column>
                    <Column field="unidadResponsable" header="Unidad responsable" sortable style={{minWidth: '10rem'}}></Column>
                    <Column field="jefeUnidad" header="Jefe de la unidad" sortable style={{minWidth: '10rem'}}></Column>
                    <Column field="objetivoArea" header="Objetivo del área" sortable style={{minWidth: '10rem'}}></Column>
                    <Column
                        header="Unidad"
                        body={(rowData: Programa) => rowData.unidad?.nombreUnidad || 'Sin unidad'}
                        sortable
                        style={{minWidth: '10rem'}}
                    ></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem'}}></Column>
                </DataTable>
            </div>
            <Dialog visible={programaDialog} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}} header="Detalles del Programa de TICs" modal className="p-fluid" footer={programaDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="anio" className="font-bold">Año</label>
                    <InputNumber inputId="anio" value={programa.anio} onValueChange={(e) => onAnioChange(e)} mode="decimal" showButtons min={2025}/>
                </div>
                <div className="field">
                    <label htmlFor="unidadResponsable" className="font-bold">Unidad responsable</label>
                    <InputText id="unidadResponsable" value={programa.unidadResponsable} onChange={(e) => onUnidadResponsableChange(e)} required autoFocus className={classNames({'p-invalid': submited && !programa.unidadResponsable})}/>
                    {submited && !programa.unidadResponsable && <small className="p-error">El nombre de la unidad responsable es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="jefeUnidad" className="font-bold">Jefe de la unidad</label>
                    <InputText id="jefeUnidad" value={programa.jefeUnidad} onChange={(e) => onJefeUnidadChange(e)} required autoFocus className={classNames({'p-invalid': submited && !programa.jefeUnidad})}/>
                    {submited && !programa.jefeUnidad && <small className="p-error">El jefe de la unidad es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="objetivoArea" className="font-bold">Objetivo del área</label>
                    <InputText id="objetivoArea" value={programa.objetivoArea} onChange={(e) => onObjetivoAreaChange(e)} required autoFocus className={classNames({'p-invalid': submited && !programa.objetivoArea})}/>
                    {submited && !programa.objetivoArea && <small className="p-error">El objetivo del área es requerido.</small>}
                </div>
                <div className="field">
                    <label className="font-bold">Unidad:</label>
                    <Dropdown value={selectedUnidad} onChange={onUnidadChange} options={unidades}
                              optionLabel="nombreUnidad" placeholder="Selecciona una unidad" className="w-full md:w-14rem"/>
                </div>
            </Dialog>
            <Dialog visible={deleteProgramaDialog} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}} header="Confirmar" modal footer={deleteProgramaDialogFooter} onHide={hideDeleteProgramaDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{fontSize: '2rem'}}/>
                    {programa && (
                        <span>
                            ¿Estás seguro de eliminar a este Programa de TICs <b>{programa.anio}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}