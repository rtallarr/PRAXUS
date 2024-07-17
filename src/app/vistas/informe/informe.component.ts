import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InformeService } from '../../servicios/informe/informe.service';
import * as dayjs from 'dayjs'
dayjs().format()
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

@Component({
  selector: 'app-informe',
  templateUrl: './informe.component.html',
  styleUrls: ['./informe.component.scss']
})
export class InformeComponent {
  id_practica: number;
  id_informe: number;
  pares_pregunta_respuesta: any[];
  fecha_informe: any;

  constructor(private route: ActivatedRoute, private _snackBar: MatSnackBar, private informeService: InformeService) {
    this.id_practica = parseInt(this.route.snapshot.url[1].path);
    this.id_informe = parseInt(this.route.snapshot.url[2].path);
    let data: any = {};
    this.informeService.get_informe_preguntas(this.id_informe).subscribe({
      next: (_data: any) => {
        data = { ...data, ..._data };
      }, complete: () => {
        let informe = data.body;
        if (!informe) {
          this.showSnackbar();
          return;
        }
        console.log(informe.fecha.replace("T", " ").replace("Z", ""))
        this.fecha_informe = dayjs(informe.fecha, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY");
        let respuestas = informe.key;
        let preguntas: any[] = informe.config_informe.pregunta_informes;
        this.pares_pregunta_respuesta = preguntas.map((pregunta: any) => {
          return [
            pregunta.enunciado,
            respuestas[pregunta.id]
          ];
        });
      }, error: (err: any) => {
        this.showSnackbar();
      }
    });

  }

  showSnackbar(message: string = "Se ha producido un error, por favor vuelva más tarde",
    action: string = "Cerrar", panelClass: string = 'red-snackbar') {
    this._snackBar.open(message, action, {
      panelClass: [panelClass],
      duration: 3000
    });
  }

}
