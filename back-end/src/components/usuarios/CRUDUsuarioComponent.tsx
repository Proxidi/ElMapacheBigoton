import React, { useState, useEffect, useRef } from 'react';
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { classNames } from "primereact/utils";
import UsuarioService from "../../services/UsuarioService";
import UnidadService from "../../services/UnidadService";

interface Unidad {
    idUnidad: number;
    nombreUnidad: string;
}

interface Usuario {
    idUsuario: string;
    nombre: string;
    apPaterno: string;
    apMaterno: string;
    contrasena: string;
    unidad: Unidad;
}

export default function CRUDUsuarioComponent() {
    const emptyUnidad: Unidad = {
        idUnidad: 0,
        nombreUnidad: '',
    };

    const emptyUsuario: Usuario = {
        idUsuario: '',
        nombre: '',
        apPaterno: '',
        apMaterno: '',
        contrasena: '',
        unidad: emptyUnidad,
    };

    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [usuario, setUsuario] = useState<Usuario>(emptyUsuario);
    const [usuarioDialog, setUsuarioDialog] = useState<boolean>(false);
    const [deleteUsuarioDialog, setDeleteUsuarioDialog] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Usuario[]>>(null);
    const [selectedUnidad, setSelectedUnidad] = useState<Unidad | null>(null);

    useEffect(() => {
        UnidadService.findAll().then((responseU) => setUnidades(responseU.data));
        UsuarioService.findAll().then((response) => setUsuarios(response.data));
    }, []);

    const openNew = () => {
        setUsuario(emptyUsuario);
        setSelectedUnidad(null);
        setSubmitted(false);
        setUsuarioDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setUsuarioDialog(false);
    };

    const hideDeleteUsuarioDialog = () => {
        setDeleteUsuarioDialog(false);
    };

    const saveUsuario = async () => {
        setSubmitted(true);

        if (usuario.idUsuario.trim() && usuario.nombre.trim() && usuario.apPaterno.trim() && usuario.apMaterno.trim() && usuario.contrasena.trim()) {
            const _usuarios = [...usuarios];
            const _usuario = {...usuario};

            if (_usuarios.some(u => u.idUsuario === usuario.idUsuario)) {
                // Update existing user
                UsuarioService.update(usuario.idUsuario, usuario);
                const index = findIndexById(usuario.idUsuario);
                _usuarios[index] = _usuario;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Registro Actualizado',
                    life: 3000
                });
            } else {
                // Create new user
                await createUsuario(_usuario);
                _usuarios.push(_usuario);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Registro Creado',
                    life: 3000
                });
            }

            setUsuarios(_usuarios);
            setUsuarioDialog(false);
            setUsuario(emptyUsuario);
        }
    };

    const createUsuario = async (_usuario: Usuario) => {
        const newUsuario = {
            idUsuario: _usuario.idUsuario,
            nombre: _usuario.nombre,
            apPaterno: _usuario.apPaterno,
            apMaterno: _usuario.apMaterno,
            contrasena: _usuario.contrasena,
            unidad: _usuario.unidad,
        };

        await UsuarioService.create(newUsuario).catch(error => {
            console.log(error);
        });
    };

    const editUsuario = async (usuario: Usuario) => {
        setUsuario({...usuario});
        setSelectedUnidad(usuario.unidad);
        setUsuarioDialog(true);
    };

    const confirmDeleteUsuario = (usuario: Usuario) => {
        setUsuario(usuario);
        setDeleteUsuarioDialog(true);
    };

    const deleteUsuario = () => {
        const _usuarios = usuarios.filter((val) => val.idUsuario !== usuario.idUsuario);
        UsuarioService.delete(usuario.idUsuario);
        setUsuarios(_usuarios);
        setDeleteUsuarioDialog(false);
        setUsuario(emptyUsuario);
        toast.current?.show({
            severity: 'success',
            summary: 'Resultado',
            detail: 'Registro Eliminado',
            life: 3000
        });
    };

    const findIndexById = (idUsuario: string) => {
        let index = -1;
        for (let i = 0; i < usuarios.length; i++) {
            if (usuarios[i].idUsuario === idUsuario) {
                index = i;
                break;
            }
        }
        return index;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onIdUsuarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _usuario = {...usuario};
        _usuario.idUsuario = val;
        setUsuario(_usuario);
    };

    const onNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _usuario = {...usuario};
        _usuario.nombre = val;
        setUsuario(_usuario);
    };

    const onApPaternoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _usuario = {...usuario};
        _usuario.apPaterno = val;
        setUsuario(_usuario);
    };

    const onApMaternoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _usuario = {...usuario};
        _usuario.apMaterno = val;
        setUsuario(_usuario);
    };

    const onContrasenaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value) || '';
        const _usuario = {...usuario};
        _usuario.contrasena = val;
        setUsuario(_usuario);
    };

    const onUnidadChange = (e: DropdownChangeEvent) => {
        const _usuario = {...usuario};
        const xunidad: Unidad = e.target.value;
        setSelectedUnidad(xunidad);
        _usuario.unidad = xunidad;
        setUsuario(_usuario);
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return <Button label="Exportar" icon="pi pi-upload" className="p-button-help" onClick={exportCSV}/>;
    };

    const actionBodyTemplate = (rowData: Usuario) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editUsuario(rowData)}/>
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteUsuario(rowData)}/>
            </React.Fragment>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Usuarios</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" placeholder="Buscar..." onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    setGlobalFilter(target.value);
                }}/>
            </IconField>
        </div>
    );

    const usuarioDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveUsuario} />
        </React.Fragment>
    );

    const deleteUsuarioDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteUsuarioDialog} />
            <Button label="Sí" icon="pi pi-check" severity="danger" onClick={deleteUsuario} />
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                <DataTable ref={dt} value={usuarios} dataKey="idUsuario" paginator rows={10}
                           rowsPerPageOptions={[5, 10, 25]} paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                           currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} usuarios"
                           globalFilter={globalFilter} header={header}>
                    <Column field="idUsuario" header="ID" sortable style={{ minWidth: '5rem' }}></Column>
                    <Column field="nombre" header="Nombre" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column field="apPaterno" header="Apellido Paterno" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column field="apMaterno" header="Apellido Materno" sortable style={{ minWidth: '10rem' }}></Column>
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={usuarioDialog} style={{ width: '40rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                    header="Detalles de Usuario" modal className="p-fluid" footer={usuarioDialogFooter} onHide={hideDialog}>

                <div className="field">
                    <label htmlFor="idUsuario" className="font-bold">
                        ID Usuario
                    </label>
                    <InputText id="idUsuario" value={usuario.idUsuario}
                               onChange={onIdUsuarioChange} required
                               className={classNames({ 'p-invalid': submitted && !usuario.idUsuario })} />
                    {submitted && !usuario.idUsuario && <small className="p-error">ID requerido.</small>}
                </div>

                <div className="field">
                    <label htmlFor="nombre" className="font-bold">
                        Nombre
                    </label>
                    <InputText id="nombre" value={usuario.nombre}
                               onChange={onNombreChange} required
                               className={classNames({ 'p-invalid': submitted && !usuario.nombre })} />
                    {submitted && !usuario.nombre && <small className="p-error">Nombre requerido.</small>}
                </div>

                <div className="field">
                    <label htmlFor="apPaterno" className="font-bold">
                        Apellido Paterno
                    </label>
                    <InputText id="apPaterno" value={usuario.apPaterno}
                               onChange={onApPaternoChange} required
                               className={classNames({ 'p-invalid': submitted && !usuario.apPaterno })} />
                    {submitted && !usuario.apPaterno && <small className="p-error">Apellido paterno requerido.</small>}
                </div>

                <div className="field">
                    <label htmlFor="apMaterno" className="font-bold">
                        Apellido Materno
                    </label>
                    <InputText id="apMaterno" value={usuario.apMaterno}
                               onChange={onApMaternoChange} required
                               className={classNames({ 'p-invalid': submitted && !usuario.apMaterno })} />
                    {submitted && !usuario.apMaterno && <small className="p-error">Apellido materno requerido.</small>}
                </div>

                <div className="field">
                    <label htmlFor="contrasena" className="font-bold">
                        Contraseña
                    </label>
                    <InputText id="contrasena" type="password" value={usuario.contrasena}
                               onChange={onContrasenaChange} required
                               className={classNames({ 'p-invalid': submitted && !usuario.contrasena })} />
                    {submitted && !usuario.contrasena && <small className="p-error">Contraseña requerida.</small>}
                </div>

                <div className="field">
                    <label className="font-bold block mb-2">Unidad: {
                        selectedUnidad?.nombreUnidad
                    }</label>
                    <Dropdown
                        value={selectedUnidad}
                        onChange={onUnidadChange}
                        options={unidades}
                        optionLabel="nombreUnidad"
                        placeholder="Seleccionar una unidad"
                        className="w-full md:w-14rem"
                    />
                </div>
            </Dialog>

            <Dialog visible={deleteUsuarioDialog} style={{ width: '32rem' }}
                    breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                    header="Confirmar" modal footer={deleteUsuarioDialogFooter} onHide={hideDeleteUsuarioDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {usuario && <span>¿Estás seguro de eliminar el usuario <b>{usuario.nombre} {usuario.apPaterno} {usuario.apMaterno}</b>?</span>}
                </div>
            </Dialog>
        </div>
    );
}