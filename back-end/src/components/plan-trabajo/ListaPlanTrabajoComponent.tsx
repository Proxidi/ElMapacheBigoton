import { useEffect, useState } from 'react';
import PlanTrabajoService from '../../services/PlanTrabajoService';
import { DataTable } from 'primereact/datatable';
import { Column }    from 'primereact/column';
import { Button }    from 'primereact/button';
import jsPDF         from 'jspdf';
import autoTable     from 'jspdf-autotable';

export default function ListaPlanTrabajoComponent() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    PlanTrabajoService.fetchAll()
        .then(resp => setRows(resp.data))
        .catch(err => console.error(err));
  }, []);

  const exportPDF = () => {
      const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'pt',
          format: [612, 1008],
      });

    // Definir encabezados
    const headers = [
      'No.','Obj.','Comp.','Unid. Resp.','Jefe Unid.',
      'Actividad','Medio Ver.','Ind.','Unid. Medida','Cant. Anual',
      'Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic',
      'Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'
    ];

    // Transformar los datos
    const data = rows.map(r => [
      r.no, r.objetivo, r.componente, r.unidadResponsable, r.jefeUnidad,
      r.actividad, r.medioVerificacion, r.indicadorResultado, r.unidadMedida, r.cantidadAnual,
      r.cEnero, r.cFebrero, r.cMarzo, r.cAbril, r.cMayo, r.cJunio,
      r.cJulio, r.cAgosto, r.cSeptiembre, r.cOctubre, r.cNoviembre, r.cDiciembre,
      r.pEnero, r.pFebrero, r.pMarzo, r.pAbril, r.pMayo, r.pJunio,
      r.pJulio, r.pAgosto, r.pSeptiembre, r.pOctubre, r.pNoviembre, r.pDiciembre
    ]);

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 60,
        styles: { fontSize: 6.0 },
        margin: { left: 1, right: 1 },
    });

    doc.save('Plan Trabajo.pdf');
  };

  return (
      <div className="card">
        <h3>Plan de Trabajo</h3>
        <Button
            label="Exportar PDF"
            icon="pi pi-file-pdf"
            onClick={exportPDF}
            className="mb-2"
        />
        <DataTable value={rows} paginator rows={10} tableStyle={{ minWidth: '50rem' }}>
          <Column field="no"                  header="No."              />
          <Column field="objetivo"            header="Objetivo"         />
          <Column field="componente"          header="Componente"       />
          <Column field="unidadResponsable"   header="Unid. Resp."      />
          <Column field="jefeUnidad"          header="Jefe Unid."       />
          <Column field="actividad"           header="Actividad"        />
          <Column field="medioVerificacion"   header="Verificación"     />
          <Column field="indicadorResultado"  header="Indicador"        />
          <Column field="unidadMedida"        header="Unid. Medida"     />
          <Column field="cantidadAnual"       header="Cant. Anual"      />

          <Column field="cEnero"              header="C_Enero"          />
          <Column field="cFebrero"            header="C_Febrero"        />
          <Column field="cMarzo"              header="C_Marzo"          />
          <Column field="cAbril"              header="C_Abril"          />
          <Column field="cMayo"               header="C_Mayo"           />
          <Column field="cJunio" header="C_Junio" />
          <Column field="cJulio" header="C_Julio" />
          <Column field="cAgosto" header="C_Agosto" />
          <Column field="cSeptiembre" header="C_Septiembre" />
          <Column field="cOctubre" header="C_Octubre" />
          <Column field="cNoviembre" header="C_Noviembre" />
          <Column field="cDiciembre" header="C_Diciembre" />

          <Column field="pEnero" header="P_Enero" />
          <Column field="pFebrero" header="P_Febrero" />
          <Column field="pMarzo" header="P_Marzo" />
          <Column field="pAbril" header="P_Abril" />
          <Column field="pMayo" header="P_Mayo" />
          <Column field="pJunio" header="P_Junio" />
          <Column field="pJulio" header="P_Julio" />
          <Column field="pAgosto" header="P_Agosto" />
          <Column field="pSeptiembre" header="P_Septiembre" />
          <Column field="pOctubre" header="P_Octubre" />
          <Column field="pNoviembre" header="P_Noviembre" />
          <Column field="pDiciembre" header="P_Diciembre" />
        </DataTable>
      </div>
  );
}
