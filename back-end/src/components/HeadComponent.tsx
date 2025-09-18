import {MenuItem} from "primereact/menuitem";
import {Menubar} from "primereact/menubar";

export default function HeadComponent() {
    const items: MenuItem[] = [
        {
            label: 'Inicio',
            icon: 'pi pi-home',
            url: '/plan-trabajo'
        },
        {
            label: 'Programas',
            icon: 'pi pi-user',
            url: '/programa'
        },
        {
            label: 'Actividades',
            icon: 'pi pi-user',
            url: '/actividad'
        },
        {
            label: 'Calendarización',
            icon: 'pi pi-user',
            url: '/calendarizacion'
        },
        {
            label: 'Unidades',
            icon: 'pi pi-user',
            url: '/unidad'
        },
        {
            label: 'Usuarios',
            icon: 'pi pi-user',
            url: '/usuario'
        },
        {
            label: 'Roles',
            icon: 'pi pi-user',
            url: '/rol'
        },
        {
            label: 'Áreas',
            icon: 'pi pi-user',
            url: '/area'
        },
        {
            label: 'Componentes',
            icon: 'pi pi-user',
            url: '/componente'
        },
        {
            label: 'Objetivos',
            icon: 'pi pi-user',
            url: '/objetivo'
        },
        {
            label: 'Unidades medida',
            icon: 'pi pi-user',
            url: '/unidad-medida'
        },
    ];

    return (
        <div className="Card">
            <Menubar model={items}/>
        </div>
    )
}