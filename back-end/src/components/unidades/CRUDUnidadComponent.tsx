import React, {useState, useEffect, useRef} from 'react';
import {Toast} from "primereact/toast";
import {DataTable} from "primereact/datatable";
import UnidadService from "../../services/UnidadService.tsx";
import {Button} from "primereact/button";
import {IconField} from "primereact/iconfield";
import {InputIcon} from "primereact/inputicon";
import {InputText} from "primereact/inputtext";
import {Toolbar} from "primereact/toolbar";
import {Column} from "primereact/column";
import {classNames} from "primereact/utils";
import {Dialog} from "primereact/dialog";
import {Dropdown, DropdownChangeEvent} from "primereact/dropdown";
import RolService from "../../services/RolService.tsx";
import AreaService from "../../services/AreaService.tsx";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Rol {
    idRol: number;
    nombreRol: string;
}

interface Area {
    idArea: number;
    nombreArea: string;
}

interface Unidad {
    idUnidad: number;
    nombreUnidad: string;
    email: string;
    rol: Rol;
    area: Area;
}

export default function CRUDUnidadComponent() {
    const emptyRol: Rol = {
        idRol: 0,
        nombreRol: ''
    };

    const emptyArea: Area = {
        idArea: 0,
        nombreArea: ''
    };

    const emptyUnidad: Unidad = {
        idUnidad: 0,
        nombreUnidad: '',
        email: '',
        rol: emptyRol,
        area: emptyArea
    };

    const [roles, setRoles] = useState<Rol[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [unidad, setUnidad] = useState<Unidad>(emptyUnidad);
    const [unidadDialog, setUnidadDialog] = useState<boolean>(false);
    const [deleteUnidadDialog, setDeleteUnidadDialog] = useState<boolean>(false);
    const [submited, setSubmited] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Unidad[]>>(null);
    const [selectedRol, setSelectedRol] = useState<Rol | null>(null);
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);

    useEffect(() => {
        RolService.findAll().then((responseR) => setRoles(responseR.data));
        AreaService.findAll().then((responseA) => setAreas(responseA.data));
        UnidadService.findAll().then((response) => setUnidades(response.data));
    }, []);

    const openNew = () => {
        setUnidad(emptyUnidad);
        setSubmited(false);
        setUnidadDialog(true);
    };

    const hideDialog = () => {
        setSubmited(false);
        setUnidadDialog(false);
    };

    const hideDeleteUnidadDialog = () => {
        setDeleteUnidadDialog(false);
    };

    const saveUnidad = async () => {
        setSubmited(true);
        try {
            if (unidad.nombreUnidad.trim() && unidad.nombreUnidad.trim() && unidad.email.trim()) {
                const _unidades = [...unidades];
                const _unidad = {...unidad};

                if (unidad.idUnidad) {
                    UnidadService.update(unidad.idUnidad, unidad);
                    const index = findIndexById(unidad.idUnidad);
                    _unidades[index] = _unidad;
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Registro Actualizado',
                        life: 3000
                    });
                } else {
                    _unidad.idUnidad = await getIdUnidad(_unidad);
                    _unidades.push(_unidad);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Registro Creado',
                        life: 3000
                    });
                }
                setUnidades(_unidades);
                setUnidadDialog(false);
                setUnidad(emptyUnidad);
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

    const getIdUnidad = async (_unidad: Unidad) => {
        let idUnidad = 0;
        const newUnidad = {
            nombreUnidad: _unidad.nombreUnidad,
            email: _unidad.email,
            rol: _unidad.rol,
            area: _unidad.area
        };
        await UnidadService.create(newUnidad).then((response) => {
            idUnidad = response.data.idUnidad;
        }).catch(error => {
            console.log(error);
        });
        return idUnidad;
    };

    const editUnidad = (unidad: Unidad) => {
        setUnidad({...unidad});
        const rolActual = roles.find(r => r.idRol === unidad.rol.idRol);
        const areaActual = areas.find(a => a.idArea === unidad.area.idArea);
        setSelectedRol(rolActual || null);
        setSelectedArea(areaActual || null);
        setUnidadDialog(true);
    };

    const confirmDeleteUnidad = (unidad: Unidad) => {
        setUnidad(unidad);
        setDeleteUnidadDialog(true);
    };

    const deleteUnidad = async () => {
        try {
            const _unidades = unidades.filter((val) => val.idUnidad !== unidad.idUnidad);
            UnidadService.delete(unidad.idUnidad);
            setUnidades(_unidades);
            setDeleteUnidadDialog(false);
            setUnidad(emptyUnidad);
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

    const findIndexById = (idUnidad: number) => {
        let index = -1;
        for (let i = 0; i < unidades.length; i++) {
            if (unidades[i].idUnidad === idUnidad) {
                index = i;
                break;
            }
        }
        return index;
    };

    const exportPDF = () => {
        const doc = new jsPDF();

        const columns = [
            { header: 'Rol', dataKey: 'rol' },
            { header: 'Area', dataKey: 'area' },
            { header: 'Unidad', dataKey: 'nombreUnidad' },
            { header: 'Correo electrónico', dataKey: 'email' },
        ];

        const rows = unidades.map((act) => ({
            rol: act.rol?.nombreRol || '',
            area: act.area?.nombreArea || '',
            nombreUnidad: act.nombreUnidad,
            email: act.email,
        }));

        autoTable(doc, {
            columns,
            body: rows,
            styles: { fontSize: 8 },
            margin: { top: 20 },
            headStyles: { fillColor: [40, 40, 40] },
        });

        doc.save('unidades.pdf');
    };

    const onNombreUnidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _unidad = {...unidad};
        _unidad.nombreUnidad = val;
        setUnidad(_unidad);
    };

    const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _unidad = {...unidad};
        _unidad.email = val;
        setUnidad(_unidad);
    };

    const onRolChange = (e: DropdownChangeEvent) => {
        const _unidad = {...unidad};
        const xrol: Rol = e.target.value;
        setSelectedRol(xrol);
        _unidad.rol = xrol;
        setUnidad(_unidad);
    };

    const onAreaChange = (e: DropdownChangeEvent) => {
        const _unidad = {...unidad};
        const xarea: Area = e.target.value;
        setSelectedArea(xarea);
        _unidad.area = xarea;
        setUnidad(_unidad);
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew}/>
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Exportar" icon="pi pi-upload" className="p-button-help" onClick={exportPDF}/>;
    };

    const actionBodyTemplate = (rowData: Unidad) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editUnidad(rowData)}/>
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteUnidad(rowData)}/>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Unidades</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search"/>
                <InputText type="search" placeholder="Buscar..." onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    setGlobalFilter(target.value);
                }}/>
            </IconField>
        </div>
    );

    const unidadDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog}/>
            <Button label="Guardar" icon="pi pi-check" onClick={saveUnidad}/>
        </React.Fragment>
    );

    const deleteUnidadDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteUnidadDialog}/>
            <Button label="Si" icon="pi pi-check" severity="danger" onClick={deleteUnidad}/>
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast}/>
            <div className="Card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <DataTable ref={dt} value={unidades} dataKey="idUnidad" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                           paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                           currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} unidades"
                           globalFilter={globalFilter} header={header}>
                    <Column field="idUnidad" header="ID" sortable style={{minWidth: '5rem'}}></Column>
                    <Column
                        header="Rol"
                        body={(rowData: Unidad) => rowData.rol?.nombreRol || 'Sin rol'}
                        sortable
                        style={{minWidth: '10rem'}}
                    ></Column>
                    <Column
                        header="Área"
                        body={(rowData: Unidad) => rowData.area?.nombreArea || 'Sin área'}
                        sortable
                        style={{minWidth: '10rem'}}
                    ></Column>
                    <Column field="nombreUnidad" header="Nombre de la unidad" sortable style={{minWidth: '10rem'}}></Column>
                    <Column field="email" header="Email" sortable style={{minWidth: '10rem'}}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '4rem'}}></Column>
                </DataTable>
            </div>
            <Dialog visible={unidadDialog} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}} header="Detalles de unidad" modal className="p-fluid" footer={unidadDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label className="font-bold">Rol:</label>
                    <Dropdown value={selectedRol} onChange={onRolChange} options={roles}
                              optionLabel="nombreRol" placeholder="Selecciona un rol" className="w-full md:w-14rem"/>
                </div>
                <div className="field">
                    <label className="font-bold">Área:</label>
                    <Dropdown value={selectedArea} onChange={onAreaChange} options={areas}
                              optionLabel="nombreArea" placeholder="Selecciona un área" className="w-full md:w-14rem"/>
                </div>
                <div className="field">
                    <label htmlFor="nombreUnidad" className="font-bold">Nombre de la unidad</label>
                    <InputText id="nombreUnidad" value={unidad.nombreUnidad} onChange={(e) => onNombreUnidadChange(e)} required autoFocus className={classNames({'p-invalid': submited && !unidad.nombreUnidad})}/>
                    {submited && !unidad.nombreUnidad && <small className="p-error">El nombre de la unidad es requerido.</small>}
                </div>
                <div className="field">
                    <label htmlFor="email" className="font-bold">Email</label>
                    <InputText id="email" value={unidad.email} onChange={(e) => onEmailChange(e)} required autoFocus className={classNames({'p-invalid': submited && !unidad.email})}/>
                    {submited && !unidad.email && <small className="p-error">El email es requerido.</small>}
                </div>
            </Dialog>
            <Dialog visible={deleteUnidadDialog} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}} header="Confirmar" modal footer={deleteUnidadDialogFooter} onHide={hideDeleteUnidadDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{fontSize: '2rem'}}/>
                    {unidad && (
                        <span>
                            ¿Estás seguro de eliminar a <b>{unidad.nombreUnidad}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
}