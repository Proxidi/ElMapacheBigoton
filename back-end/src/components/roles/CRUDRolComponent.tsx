import React, {useState, useEffect, useRef} from 'react';
import {Toast} from "primereact/toast";
import {DataTable} from "primereact/datatable";
import RolService from "../../services/RolService";
import {Button} from "primereact/button";
import {IconField} from "primereact/iconfield";
import {InputIcon} from "primereact/inputicon";
import {InputText} from "primereact/inputtext";
import {Toolbar} from "primereact/toolbar";
import {Column} from "primereact/column";
import {classNames} from "primereact/utils";
import {Dialog} from "primereact/dialog";

interface Rol {
    idRol: number;
    nombreRol: string;
}

interface Unidad {
    idUnidad: number;
    nombreUnidad: string;
    email: string;
}

export default function CRUDRolComponent() {
    const emptyRol: Rol = {
        idRol: 0,
        nombreRol: '',
    };

    const [listaUnidades, setListaUnidades] = useState<Unidad[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [rol, setRol] = useState<Rol>(emptyRol);
    const [rolDialog, setRolDialog] = useState<boolean>(false);
    const [deleteRolDialog, setDeleteRolDialog] = useState<boolean>(false);
    const [rolListado, setRolListado] = useState<boolean>(false);
    const [submited, setSubmited] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Rol[]>>(null);

    useEffect(() => {
        RolService.findAll().then((response) => setRoles(response.data));
    }, []);

    const openNew = () => {
        setRol(emptyRol);
        setSubmited(false);
        setRolDialog(true);
    };

    const hideListadoDialog = () => {
        setSubmited(false);
        setRolListado(false);
    };

    const hideDialog = () => {
        setSubmited(false);
        setRolDialog(false);
    };

    const hideDeleteRolDialog = () => {
        setDeleteRolDialog(false);
    };

    const saveRol = async () => {
        setSubmited(true);
        if (rol.nombreRol.trim()) {
            const _roles = [...roles];
            const _rol = {...rol};

            if (rol.idRol) {
                RolService.update(rol.idRol, rol);
                const index = findIndexById(rol.idRol);
                _roles[index] = _rol;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Registro Actualizado',
                    life: 3000
                });
            } else {
                _rol.idRol = await getIdRol(_rol);
                _roles.push(_rol);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Registro Creado',
                    life: 3000
                });
            }
            setRoles(_roles);
            setRolDialog(false);
            setRol(emptyRol);
        }
    };

    const getIdRol = async (_rol: Rol) => {
        let idRol = 0;
        const newRol = {
            nombreRol: _rol.nombreRol
        };
        await RolService.create(newRol).then((response) => {
            idRol = response.data.idRol;
        }).catch(error => {
            console.log(error);
        });
        return idRol;
    };

    const listarUnidades = (rol: Rol)=> {
        setRol({...rol});
        RolService.findById(rol.idRol).then((response) => {
            setListaUnidades(response.data.unidades);
        }).catch(error => {
            console.log(error);
        })
        setRolListado(true)
    }

    const editRol = (rol: Rol) => {
        setRol({...rol});
        setRolDialog(true);
    };

    const confirmDeleteRol = (rol: Rol) => {
        setRol(rol);
        setDeleteRolDialog(true);
    };

    const deleteRol = () => {
        const _roles = roles.filter((val) => val.idRol !== rol.idRol);
        RolService.delete(rol.idRol);
        setRoles(_roles);
        setDeleteRolDialog(false);
        setRol(emptyRol);
        toast.current?.show({
            severity: 'success',
            summary: 'Resultado',
            detail: 'Registro Eliminado',
            life: 3000
        });
    };

    const findIndexById = (id: number) => {
        return roles.findIndex(o => o.idRol === id);
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onNombreRolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _rol = {...rol};
        _rol.nombreRol = val;
        setRol(_rol);
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

    const actionBodyTemplate = (rowData: Rol) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-prime" style={{color: 'green'}} rounded outlined className="mr-2" onClick={() => listarUnidades(rowData)}/>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editRol(rowData)}/>
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteRol(rowData)}/>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Roles</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search"/>
                <InputText type="search" placeholder="Buscar..." onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    setGlobalFilter(target.value);
                }}/>
            </IconField>
        </div>
    );

    const rolDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog}/>
            <Button label="Guardar" icon="pi pi-check" onClick={saveRol}/>
        </React.Fragment>
    );

    const deleteRolDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteRolDialog}/>
            <Button label="Si" icon="pi pi-check" severity="danger" onClick={deleteRol}/>
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast}/>
            <div className="Card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <DataTable ref={dt} value={roles} dataKey="idRol" paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                           paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                           currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} roles"
                           globalFilter={globalFilter} header={header}>
                    <Column field="idRol" header="ID" sortable style={{minWidth: '5rem'}}></Column>
                    <Column field="nombreRol" header="Nombre Rol" sortable style={{minWidth: '20rem'}}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem'}}></Column>
                </DataTable>
            </div>

            <Dialog visible={rolDialog} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}}
                    header="Detalles de Rol" modal className="p-fluid" footer={rolDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="nombreRol" className="font-bold">
                        Nombre Rol
                    </label>
                    <InputText id="nombreRol" value={rol.nombreRol} onChange={(e) => onNombreRolChange(e)}
                               required autoFocus className={classNames({'p-invalid': submited && !rol.nombreRol})}/>
                    {submited && !rol.nombreRol && <small className="p-error">El nombre del rol es requerido.</small>}
                </div>
            </Dialog>

            <Dialog visible={deleteRolDialog} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}}
                    header="Confirmar" modal footer={deleteRolDialogFooter} onHide={hideDeleteRolDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{fontSize: '2rem'}}/>
                    {rol && (
                        <span>
                            ¿Estás seguro de eliminar el rol <b>{rol.nombreRol}</b>?
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog visible={rolListado} style={{width: '32rem'}} breakpoints={{'960px': '75vw', '641px': '90vw'}}
                    header="Unidades del rol" modal className="p-fluid"
                    onHide={hideListadoDialog}>
                <div className="field">
                    <ul>
                        {listaUnidades.map(item => <li>{item.nombreUnidad}</li>)}
                    </ul>
                </div>
            </Dialog>
        </div>
    );
}