import React, {useState, useEffect, useRef} from 'react';
import {Toast} from "primereact/toast";
import {DataTable} from "primereact/datatable";
import ActividadService from "../../services/ActividadService.tsx";
import {Button} from "primereact/button";
import {IconField} from "primereact/iconfield";
import {InputIcon} from "primereact/inputicon";
import {InputText} from "primereact/inputtext";
import {Toolbar} from "primereact/toolbar";
import {Column} from "primereact/column";
import {classNames} from "primereact/utils";
import {Dialog} from "primereact/dialog";
import {InputNumber, InputNumberValueChangeEvent} from "primereact/inputnumber";
import ProgramaService from "../../services/ProgramaService.tsx";
import ObjetivoService from "../../services/ObjetivoService.tsx";
import ComponenteService from "../../services/ComponenteService.tsx";
import UnidadService from "../../services/UnidadService.tsx";
import UnidadMedidaService from "../../services/UnidadMedidaService.tsx";
import {Dropdown, DropdownChangeEvent} from "primereact/dropdown";

interface Programa {
    idPrograma: number;
    anio: number;
    unidadResponsable: string;
    jefeUnidad: string;
    objetivoArea: string;
}

interface Objetivo {
    idObjetivo: number;
    nombreObjetivo: string;
    estrategia: string;
    defEstrategia: string;
}

interface Componente {
    idComponente: number;
    nombreComponente: string;
    nivel: string;
    indicador: string;
}

interface Unidad {
    idUnidad: number;
    nombreUnidad: string;
    email: string;
}

interface UnidadMedida {
    idUnidadMedida: number;
    nombreUnidadMedida: string;
}

interface Actividad {
    idActividad: number;
    noActividad: number;
    nombreActividad: string;
    medioVerificacion: string;
    indicadorResultado: string;
    programa: Programa;
    objetivo: Objetivo;
    componente: Componente;
    unidad: Unidad;
    unidadMedida: UnidadMedida;
}

export default function CRUDActividadComponent() {
    const emptyPrograma: Programa = {
        idPrograma: 0,
        anio: 0,
        unidadResponsable: '',
        jefeUnidad: '',
        objetivoArea: ''
    };

    const emptyObjetivo: Objetivo = {
        idObjetivo: 0,
        nombreObjetivo: '',
        estrategia: '',
        defEstrategia: ''
    };

    const emptyComponente: Componente = {
        idComponente: 0,
        nombreComponente: '',
        nivel: '',
        indicador: ''
    };

    const emptyUnidad: Unidad = {
        idUnidad: 0,
        nombreUnidad: '',
        email: ''
    };

    const emptyUnidadMedida: UnidadMedida = {
        idUnidadMedida: 0,
        nombreUnidadMedida: ''
    };

    const emptyActividad: Actividad = {
        idActividad: 0,
        noActividad: 0,
        nombreActividad: '',
        medioVerificacion: '',
        indicadorResultado: '',
        programa: emptyPrograma,
        objetivo: emptyObjetivo,
        componente: emptyComponente,
        unidad: emptyUnidad,
        unidadMedida: emptyUnidadMedida
    };

    const [programas, setProgramas] = useState<Programa[]>([]);
    const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
    const [componentes, setComponentes] = useState<Componente[]>([]);
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);
    const [actividades, setActividades] = useState<Actividad[]>([]);
    const [actividad, setActividad] = useState<Actividad>(emptyActividad);
    const [actividadDialog, setActividadDialog] = useState<boolean>(false);
    const [deleteActividadDialog, setDeleteActividadDialog] = useState<boolean>(false);
    const [submited, setSubmited] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Actividad[]>>(null);
    const [selectedPrograma, setSelectedPrograma] = useState<Programa | null>(null);
    const [selectedObjetivo, setSelectedObjetivo] = useState<Objetivo | null>(null);
    const [selectedComponente, setSelectedComponente] = useState<Componente | null>(null);
    const [selectedUnidad, setSelectedUnidad] = useState<Unidad | null>(null);
    const [selectedUnidadMedida, setSelectedUnidadMedida] = useState<UnidadMedida | null>(null);

    useEffect(() => {
        ProgramaService.findAll().then((responseP) => setProgramas(responseP.data));
        ObjetivoService.findAll().then((responseO) => setObjetivos(responseO.data));
        ComponenteService.findAll().then((responseC) => setComponentes(responseC.data));
        UnidadService.findAll().then((responseU) => setUnidades(responseU.data));
        UnidadMedidaService.findAll().then((responseUM) => setUnidadesMedida(responseUM.data));
        ActividadService.findAll().then((response) => setActividades(response.data));
    }, []);

    const openNew = () => {
        setActividad(emptyActividad);
        setSubmited(false);
        setActividadDialog(true);
    };

    const hideDialog = () => {
        setSubmited(false);
        setActividadDialog(false);
    };

    const hideDeleteActividadDialog = () => {
        setDeleteActividadDialog(false);
    };

    const saveActividad = async () => {
        setSubmited(true);
        try{
            if (actividad.noActividad > 0 && actividad.nombreActividad.trim() && actividad.medioVerificacion.trim() && actividad.indicadorResultado.trim() && actividad.unidad.idUnidad > 0) {
                const _actividades = [...actividades];
                const _actividad = {...actividad};

                if (actividad.idActividad) {
                    ActividadService.update(actividad.idActividad, actividad);
                    const index = findIndexById(actividad.idActividad);
                    _actividades[index] = _actividad;
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Registro Actualizado',
                        life: 3000
                    });
                } else {
                    _actividad.idActividad = await getIdActividad(_actividad);
                    _actividades.push(_actividad);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Registro Creado',
                        life: 3000
                    });
                }
                setActividades(_actividades);
                setActividadDialog(false);
                setActividad(emptyActividad);
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

    const getIdActividad = async (_actividad: Actividad) => {
        let idActividad = 0;
        const newActividad= {
            noActividad: _actividad.noActividad,
            nombreActividad: _actividad.nombreActividad,
            medioVerificacion: _actividad.medioVerificacion,
            indicadorResultado: _actividad.indicadorResultado,
            programa:{
                idPrograma: selectedPrograma?.idPrograma,
            },
            objetivo:{
                idObjetivo: selectedObjetivo?.idObjetivo,
            },
            componente:{
                idComponente: selectedComponente?.idComponente,
            },
            unidad:{
                idUnidad: selectedUnidad?.idUnidad,
            },
            unidadMedida:{
                idUnidadMedida: selectedUnidadMedida?.idUnidadMedida,
            },
        };
        await ActividadService.create(newActividad).then((response) => {
            idActividad = response.data.idActividad;
        }).catch(error => {
            console.log(error);
        });
        return idActividad;
    };

    const editActividad = (actividad: Actividad) => {
        setActividad({...actividad});
        const programaActual = programas.find(p => p.idPrograma === actividad.programa.idPrograma);
        const objetivoActual = objetivos.find(o => o.idObjetivo === actividad.objetivo.idObjetivo);
        const componenteActual = componentes.find(c => c.idComponente === actividad.componente.idComponente);
        const unidadActual = unidades.find(u => u.idUnidad === actividad.unidad.idUnidad);
        const unidadMedidaActual = unidadesMedida.find(um => um.idUnidadMedida === actividad.unidadMedida.idUnidadMedida);
        setSelectedPrograma(programaActual || null);
        setSelectedObjetivo(objetivoActual || null);
        setSelectedComponente(componenteActual || null);
        setSelectedUnidad(unidadActual || null);
        setSelectedUnidadMedida(unidadMedidaActual || null);
        setActividadDialog(true);
    };

    const confirmDeleteActividad = (actividad: Actividad) => {
        setActividad(actividad);
        setDeleteActividadDialog(true);
    };

    const deleteActividad = () => {
        try{
            const _actividades = actividades.filter((val) => val.idActividad !== actividad.idActividad);
            ActividadService.delete(actividad.idActividad);
            setActividades(_actividades);
            setDeleteActividadDialog(false);
            setActividad(emptyActividad);
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

    const findIndexById = (idActividad: number) => {
        let index = -1;
        for (let i = 0; i < actividades.length; i++) {
            if (actividades[i].idActividad === idActividad) {
                index = i;
                break;
            }
        }
        return index;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onProgramaChange = (e: DropdownChangeEvent) => {
        const _actividad = {...actividad};
        const xprograma: Programa = e.target.value;
        setSelectedPrograma(xprograma);
        _actividad.programa = xprograma;
        setActividad(_actividad);
    };

    const onNoActividadChange = (e: InputNumberValueChangeEvent) => {
        const val = e.value ?? 0;
        const _actividad = {...actividad};
        _actividad.noActividad = val;
        setActividad(_actividad);
    };

    const onObjetivoChange = (e: DropdownChangeEvent) => {
        const _actividad = {...actividad};
        const xobjetivo: Objetivo = e.target.value;
        setSelectedObjetivo(xobjetivo);
        _actividad.objetivo = xobjetivo;
        setActividad(_actividad);
    };

    const onComponenteChange = (e: DropdownChangeEvent) => {
        const _actividad = {...actividad};
        const xcomponente: Componente = e.target.value;
        setSelectedComponente(xcomponente);
        _actividad.componente = xcomponente;
        setActividad(_actividad);
    };

    const onUnidadChange = (e: DropdownChangeEvent) => {
        const _actividad = {...actividad};
        const xunidad: Unidad = e.target.value;
        setSelectedUnidad(xunidad);
        _actividad.unidad = xunidad;
        setActividad(_actividad);
    };

    const onNombreActividadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _actividad = {...actividad};
        _actividad.nombreActividad = val;
        setActividad(_actividad);
    };

    const onMedioVerificacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _actividad = {...actividad};
        _actividad.medioVerificacion = val;
        setActividad(_actividad);
    };

    const onIndicadorResultadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _actividad = {...actividad};
        _actividad.indicadorResultado = val;
        setActividad(_actividad);
    };
    const onUnidadMedidaChange = (e: DropdownChangeEvent) => {
        const _actividad = {...actividad};
        const xunidadMedida: UnidadMedida = e.target.value;
        setSelectedUnidadMedida(xunidadMedida);
        _actividad.unidadMedida = xunidadMedida;
        setActividad(_actividad);
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

    const actionBodyTemplate = (rowData: Actividad) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editActividad(rowData)}/>
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteActividad(rowData)}/>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Actividades</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search"/>
                <InputText type="search" placeholder="Buscar..." onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    setGlobalFilter(target.value);
                }}/>
            </IconField>
        </div>
    );

    const actividadDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog}/>
            <Button label="Guardar" icon="pi pi-check" onClick={saveActividad}/>
        </React.Fragment>
    );

    const deleteActividadDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteActividadDialog}/>
            <Button label="Si" icon="pi pi-check" severity="danger" onClick={deleteActividad}/>
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast}/>
            <div className="Card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <DataTable ref={dt} value={actividades} dataKey="idActividad" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                           paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                           currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} actividades"
                           globalFilter={globalFilter} header={header}>
                    <Column field="idActividad" header="ID" sortable style={{minWidth: '5rem'}}></Column>
                    <Column
                        header="Programa"
                        body={(rowData: Actividad) => rowData.programa?.anio || 'Sin programa'}
                        sortable
                        style={{minWidth: '10rem'}}
                    ></Column>
                    <Column field="noActividad" header="Número de la actividad" sortable style={{minWidth: '10rem'}}></Column>
                    <Column
                        header="Objetivo"
                        body={(rowData: Actividad) => rowData.objetivo?.nombreObjetivo || 'Sin objetivo'}
                        sortable
                        style={{minWidth: '10rem'}}
                    ></Column>
                    <Column
                        header="Componente"
                        body={(rowData: Actividad) => rowData.componente?.nombreComponente || 'Sin componente'}
                        sortable
                        style={{minWidth: '10rem'}}
                    ></Column>
                    <Column
                        header="Unidad"
                        body={(rowData: Actividad) => rowData.unidad?.nombreUnidad || 'Sin unidad'}
                        sortable
                        style={{minWidth: '10rem'}}
                    ></Column>
                    <Column field="nombreActividad" header="Nombre de la actividad" sortable style={{minWidth: '10rem'}}></Column>
                    <Column field="medioVerificacion" header="Medio de verificación" sortable style={{minWidth: '10rem'}}></Column>
                    <Column field="indicadorResultado" header="Indicador de resultado" sortable style={{minWidth: '10rem'}}></Column>
                    <Column
                        header="UnidadMedida"
                        body={(rowData: Actividad) => rowData.unidadMedida?.nombreUnidadMedida || 'Sin unidad de medida'}
                        sortable
                        style={{minWidth: '10rem'}}
                    ></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem'}}></Column>
                </DataTable>
            </div>
            <Dialog visible={actividadDialog} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}} header="Detalles de actividad" modal className="p-fluid" footer={actividadDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label className="font-bold">Programa:</label>
                    <Dropdown value={selectedPrograma} onChange={onProgramaChange} options={programas}
                              optionLabel="anio" placeholder="Selecciona el año del programa" className="w-full md:w-14rem"/>
                </div>
                <div className="field">
                    <label htmlFor="noActividad" className="font-bold">Número de actividad</label>
                    <InputNumber inputId="noActividad" value={actividad.noActividad} onValueChange={(e) => onNoActividadChange(e)} mode="decimal" showButtons min={1}/>
                </div>
                <div className="field">
                    <label className="font-bold">Objetivo:</label>
                    <Dropdown value={selectedObjetivo} onChange={onObjetivoChange} options={objetivos}
                              optionLabel="nombreObjetivo" placeholder="Selecciona un objetivo" className="w-full md:w-14rem"/>
                </div>
                <div className="field">
                    <label className="font-bold">Componente:</label>
                    <Dropdown value={selectedComponente} onChange={onComponenteChange} options={componentes}
                              optionLabel="nombreComponente" placeholder="Selecciona un componente" className="w-full md:w-14rem"/>
                </div>
                <div className="field">
                    <label className="font-bold">Unidad:</label>
                    <Dropdown value={selectedUnidad} onChange={onUnidadChange} options={unidades}
                              optionLabel="nombreUnidad" placeholder="Selecciona una unidad" className="w-full md:w-14rem"/>
                </div>
                <div className="field">
                    <label htmlFor="nombreActividad" className="font-bold">Nombre de la actividad</label>
                    <InputText id="nombreActividad" value={actividad.nombreActividad} onChange={(e) => onNombreActividadChange(e)} required autoFocus className={classNames({'p-invalid': submited && !actividad.nombreActividad})}/>
                    {submited && !actividad.nombreActividad && <small className="p-error">El nombre de la actividad es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="medioVerificacion" className="font-bold">Medio de verificación</label>
                    <InputText id="medioVerificacion" value={actividad.medioVerificacion} onChange={(e) => onMedioVerificacionChange(e)} required autoFocus className={classNames({'p-invalid': submited && !actividad.medioVerificacion})}/>
                    {submited && !actividad.medioVerificacion && <small className="p-error">El medio de verificación de la actividad es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="indicadorResultado" className="font-bold">Indicador de resultado</label>
                    <InputText id="indicadorResultado" value={actividad.indicadorResultado} onChange={(e) => onIndicadorResultadoChange(e)} required autoFocus className={classNames({'p-invalid': submited && !actividad.indicadorResultado})}/>
                    {submited && !actividad.indicadorResultado && <small className="p-error">El indicador de resultado de la actividad es requerido.</small>}
                </div>
                <div className="field">
                    <label className="font-bold">Unidad de Medida:</label>
                    <Dropdown value={selectedUnidadMedida} onChange={onUnidadMedidaChange} options={unidadesMedida}
                              optionLabel="nombreUnidadMedida" placeholder="Selecciona una unidad de medida" className="w-full md:w-14rem"/>
                </div>
            </Dialog>
            <Dialog visible={deleteActividadDialog} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}} header="Confirmar" modal footer={deleteActividadDialogFooter} onHide={hideDeleteActividadDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{fontSize: '2rem'}}/>
                    {actividad && (
                        <span>
                            ¿Estás seguro de eliminar a la actividad número <b>{actividad.noActividad}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}