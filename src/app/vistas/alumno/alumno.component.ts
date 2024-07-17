import { Component, OnInit } from '@angular/core';
import { ObtenerDatosService } from 'src/app/servicios/alumno/obtener_datos.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { GestionarService } from 'src/app/servicios/alumno/gestionar_practica.service';
import { SupervisorService } from 'src/app/servicios/supervisor/supervisor.service';
import { Router } from "@angular/router"
import { NotificacionesService } from 'src/app/servicios/notificaciones/notificaciones.service';
import { DataUsuarioService } from 'src/app/servicios/data_usuario/data-usuario.service';
import { MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { async } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { Console } from 'console';

@Component({
  selector: 'alumno',
  templateUrl: './alumno.component.html',
  styleUrls: ['./alumno.component.scss']
})
export class DetalleAlumnoComponent implements OnInit {
  usuario: any = {}
  estudiante: any = {}
  config_practicas: any = [];
  practicas: any = [];
  solicitudes_practicas: any = {};

  id_p: any;
  resenas_supervisor: any = [];
  flag: any = {}

  estado_config: string = "";

  nombres_config_practica: string[] = [];
  practicas_correspondiente_nombre: any = [];

  informe_final: any = {};
  flags_inscripcion_list: boolean[] = [];
  link_finalizacion = ""
  link_inscripcion = ""
  doc_str = "documento";
  doc_extra_str = "documento_extra";

  evaluaciones: any = [];
  aptitudes_practica: any = [];
  notas_aptitudes: any = [];
  notas_promedio: any = [];
  hay_respuesta: any = [];

  fechasSeleccionadas: Date[][] = [];

  documentos_enviados: any = {};

  warning_text: string = "No puede finalizar la práctica hasta que subas todos los documentos solicitados";

  constructor(private service_datos: ObtenerDatosService, private activated_route: ActivatedRoute, private _snackBar: MatSnackBar,
    private service_gestion: GestionarService, private service_supervisor: SupervisorService, private router: Router,
    private service_noti: NotificacionesService, private service_obtener: DataUsuarioService) {
    this.usuario = JSON.parse(localStorage.getItem('auth-user') || '{}').userdata;
    this.estudiante = this.usuario.estudiante;
    this.estado_config = this.usuario.config;

    //console.log("usuario:",this.usuario);
    //console.log("estudiante:",this.estudiante);
  }

  ngOnInit() {
    const param_upload_success = this.activated_route.snapshot.queryParamMap.get('upload_success');

    let snackBarRef: MatSnackBarRef<any> | undefined = undefined;

    //console.log("PARAMETRO URL",param_upload_success);
    if (param_upload_success == "success") {
      snackBarRef = this._snackBar.open("Archivo subido correctamente", "Cerrar", {
        panelClass: ['green-snackbar'],
        duration: 3000
      });
    } else if (param_upload_success == "format") {
      snackBarRef = this._snackBar.open("Archivo con formato incorrecto", "Cerrar", {
        panelClass: ['red-snackbar'],
        duration: 3000
      });
    } else if (param_upload_success == "error") {
      snackBarRef = this._snackBar.open("Error al subir archivo", "Cerrar", {
        panelClass: ['red-snackbar'],
        duration: 3000
      });
    }

    const param_inscripcion_success = this.activated_route.snapshot.queryParamMap.get('inscripcion_success');
    if (param_inscripcion_success == "success") {
      snackBarRef = this._snackBar.open("Práctica inscrita correctamente", "Cerrar", {
        panelClass: ['green-snackbar'],
        duration: 3000
      });
    } else if (param_inscripcion_success == "error") {
      snackBarRef = this._snackBar.open("Error al inscribir práctica", "Cerrar", {
        panelClass: ['red-snackbar'],
        duration: 3000
      });
    }

    const param_finalizacion_success = this.activated_route.snapshot.queryParamMap.get('finalizacion_success');
    if (param_finalizacion_success == "success") {
      snackBarRef = this._snackBar.open("Práctica finalizada correctamente", "Cerrar", {
        panelClass: ['green-snackbar'],
        duration: 3000
      });
    }

    let respuesta: any = {};

    // Request para obtener todas las config practicas
    this.service_datos.obtener_todos_config_practica().subscribe({
      next: (data: any) => {
        respuesta = { ...respuesta, ...data }
      },
      error: (error: any) => console.log(error),
      complete: () => {
        this.config_practicas = respuesta.body;
        //console.log("Configuraciones de practica:",this.config_practicas)
        //console.log("id_carrera estudiante:",this.estudiante.id_carrera)

        // Guardar nombres de las configuraciones de practica en un arreglo
        this.config_practicas.forEach((element: any) => {
          // verificar que el nombre no este en el arreglo
          if (element.id_carrera == this.estudiante.id_carrera) {
            if (!this.nombres_config_practica.includes(element.nombre)) {
              this.nombres_config_practica.push(element.nombre);
              this.practicas_correspondiente_nombre.push([element.nombre]);
              this.fechasSeleccionadas.push([]);
            }
          }
        });
        console.log("Practicas Correspondientes:", this.practicas_correspondiente_nombre)
        //console.log("Nombres de configuraciones de practica:",this.nombres_config_practica)

        // Request para obtener todas las practicas de acuerdo al id del estudiante
        this.service_datos.obtener_practica(this.estudiante.id).subscribe({
          next: (data: any) => {
            respuesta = { ...respuesta, ...data }
          },
          error: (error: any) => console.log(error),
          complete: async () => {
            this.practicas = respuesta.body;
            let index = 0;

            // Guardar nombres y practicas en un arreglo
            this.practicas.forEach(async (practica_aux: any) => {
              this.comentarios(practica_aux.id)
              //console.log("reseñas supervisor:", this.resenas_supervisor) 
              index += 1;
              this.flags_inscripcion_list.push(false);
              //console.log("practica:",element.modalidad.config_practica.nombre)
              // Para cada practica que el alumno tiene, encontrar el nombre de la configuracion de practica en el arreglo
              // de nombres y agregar la practica en el arreglo que se encarga de mantener la correspondencia entre nombre y practica
              if (practica_aux.modalidad.config_practica.nombre == this.nombres_config_practica.find((elemento: any) => elemento == practica_aux.modalidad.config_practica.nombre)) {
                let index = this.nombres_config_practica.indexOf(practica_aux.modalidad.config_practica.nombre);
                practica_aux.documentos.map((doc: any) => {
                  // Cambiar además las strings de tipo_archivo a un arreglo de strings
                  doc.solicitud_documento.tipo_archivo = doc.solicitud_documento.tipo_archivo.split(",");
                  return doc;
                });
                this.practicas_correspondiente_nombre[index].push(practica_aux);

                if (practica_aux.informes.length > 0 && practica_aux.modalidad.config_practica.frecuencia_informes == "diario") {
                  for (var informe of practica_aux.informes) {
                    //console.log("informe:",informe.fecha)
                    if (informe.fecha != null) {
                      informe.fecha = informe.fecha.split("T")[0];
                      informe.fecha += "T12:00:00.000Z";
                      this.fechasSeleccionadas[index].push(informe.fecha);
                      //console.log("informe despues de modificar:",informe.fecha)
                    }
                  }
                }
              }
              // request para obtener todas las solicitudes_documentos de la practica actual

              //console.log("this.documentos_enviados ANTES: ", this.documentos_enviados)
              await new Promise((resolve) => {
                this.service_datos.obtener_solicitudes_documentos_practica(practica_aux.modalidad.config_practica.id, practica_aux.id).subscribe({
                  next: (data: any) => {
                    respuesta = { ...respuesta, ...data }
                  },
                  error: (error: any) => console.log(error),
                  complete: () => {
                    this.solicitudes_practicas[practica_aux.id] = respuesta.body;
                    let faltan_documentos = 0;
                    //console.log("practicas_correspondiente_nombre: ", this.practicas_correspondiente_nombre)
                    for (let practica of this.practicas_correspondiente_nombre) {
                      //console.log("this.solicitudes_practicas[practica_aux.id]: ", this.solicitudes_practicas[practica_aux.id])
                      for (let soli of this.solicitudes_practicas[practica_aux.id]) {
                        if (soli.documentos.length == 0) {
                          //console.log("doc check")
                          faltan_documentos = 1;
                          this.documentos_enviados[practica_aux.id] = 0;
                          break;
                        }
                      }
                      //console.log("practica_aux.documento_extras: ", practica_aux.documento_extras)
                      for (let docuex of practica_aux.documento_extras) {
                        if (docuex.key == null) {
                          //console.log("doc_extra check")
                          faltan_documentos = 1;
                          this.documentos_enviados[practica_aux.id] = 0;
                          break;
                        }
                      }
                      //console.log("practica_aux.informes: ", practica_aux.informes)
                      for (let informe of practica_aux.informes) {
                        if ((informe.config_informe.tipo_informe).toLowerCase() == "informe final") {
                          if (informe.key == null || informe.key == undefined || Object.keys(informe.key).length == 0) {
                            //console.log("informe check")
                            faltan_documentos = 1;
                            this.documentos_enviados[practica_aux.id] = 0;
                            break;
                          }
                        }
                      }
                      //console.log("faltan_documentos: ", faltan_documentos)
                      if (faltan_documentos == 0) { this.documentos_enviados[practica_aux.id] = 1; }
                    }
                    //console.log("DOCUMENTOS ENVIADOS",this.documentos_enviados)
                    //console.log("Solicitudes:", this.solicitudes_practicas)
                    resolve(true);
                  }
                });
              })
              //console.log("this.documentos_enviados DESPUÉS: ", this.documentos_enviados)
            });


            for (var item of this.practicas) {
              this.evaluaciones.push(item.respuesta_supervisors)
            }

            /*
            this.evaluaciones = this.practicas.filter((respuesta_supervisors: any) => {
              return !isNaN(respuesta_supervisors.respuesta);
            });
            */



            for (var item of this.evaluaciones) {
              this.hay_respuesta.push(0)
              for (var item2 of item) {
                let temp: any = [];
                let nota_promedio = 0;
                let prom = 0;
                if (item2.pregunta_supervisor != null) {
                  if (item2.pregunta_supervisor.enunciado == "Evalue entre 1 y 5 las siguientes aptitudes del practicante") {
                    this.hay_respuesta.pop();
                    this.hay_respuesta.push(1);
                    if (item2.pregunta_supervisor.opciones.indexOf(";;") != -1) {
                      this.aptitudes_practica.push(item2.pregunta_supervisor.opciones.split(";;"))
                      temp = item2.respuesta.split(",");
                      for (var n of temp) {
                        nota_promedio += Number(n);
                        prom += 1;
                      }

                      this.notas_aptitudes.push(temp);
                      this.notas_promedio.push(nota_promedio / prom)
                      break
                    }
                  }
                }
              }


            }

            //console.log("Practicas correspondientes a nombre:",this.practicas_correspondiente_nombre)
          }
        });
      }
    });
  }


  descargar_documento(documento_id: string, solicitud_tipo: string) {
    //console.log("decargar documento")
    // abrir nueva pestaña con url de descarga, que es url_backend (sacada desde el env) + /documentos/ + documento_key
    if (solicitud_tipo == "documento") {
      window.open(environment.url_back + "/documento/download?id=" + documento_id, "_blank");
    }
    else {
      window.open(environment.url_back + "/documento_extra/download?id=" + documento_id, "_blank");
    }
  }

  finalizar_practica(practica: any) {
    window.location.href = environment.url_front + "/encuestaFinal/" + practica.id;
  }

  abrir_inscripcion(index: number) {
    // checkear si el estudiante ya tiene una práctica inscrita por cada practica en el arreglo practicas
    // si es así, no se puede inscribir a otra práctica
    let practicas_inscritas = this.practicas.filter((practica: any) => practica.estado == environment.estado_practica.en_curso);
    if (practicas_inscritas.length > 0) {
      this._snackBar.open("Error, ya tiene una práctica en curso.", "Cerrar", {
        panelClass: ['red-snackbar'],
        duration: 3000
      });
      return;
    }
    else {
      this.flags_inscripcion_list[index] = true;
    }
  }

  redirigir_a_ingreso_informe(id_informe: any) {
    // redirigir a la página de ingreso de informe
    this.router.navigate(['/ingreso-informe'], { queryParams: { id_informe: id_informe } });
  }

  isEmptyObject(obj: any): boolean {
    return obj && Object.keys(obj).length === 0;
  }

  minDate: Date | null = null;
  selectedDate: any = null;

  onFechaClick($event: any, id_practica: any) {
    //this.minDate = new Date('2015-06-24T18:30:00.000Z'); // any date, only to force rendering
    //setTimeout(() => {
    //  this.minDate = null; // Set null to remove the date restriction
    //}, 0); // Wait to change-detection function has terminated to execute a new change to force rendering the rows and cells   
    const year = $event.getFullYear();
    const month = $event.getMonth() + 1;
    const day = $event.getDate();
    const fechaParseada = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T12:00:00.000Z`;
    this.selectedDate = fechaParseada;

    // search for the id_practica in the array of practicas
    let practica = this.practicas.find((practica: any) => practica.id == id_practica);
    if (practica) {
      let informe = practica.informes.find((informe: any) => {
        if (informe.fecha == fechaParseada && informe.config_informe.tipo_informe != "informe final") {
          return true;
        }
        return false;
      });
      if (informe) {
        //console.log("informe encontrado:",informe)
        if (informe.key != null) {
          // redirect to the page to show the informe /estudiante-ver-informe/{{practica[1].id}}/{{informe.id}}          
          this.router.navigate(['/estudiante-ver-informe/', practica.id, informe.id]);
        }
        else {
          // redirect to the page to enter the informe /estudiante-ingresar-informe/{{practica[1].id}}/{{informe.id}}
          this.redirigir_a_ingreso_informe(informe.id);
        }
      }
      else {
        //console.log("informe no encontrado:")
      }
    }
    else {
      console.log("practica no encontrada")
    }
    ////console.log("fecha parseada:",fechaParseada); 
    //this.fechasSeleccionadas[index] = [...this.fechasSeleccionadas[index], new Date(fechaParseada)]
  }

  dateClass(index: number, id_practica: any) {
    //console.log("index:",index)
    return (date: Date): MatCalendarCellCssClasses => {
      const highlightDate = this.fechasSeleccionadas[index]
        .map((strDate) => new Date(strDate))
        .some(
          (d) =>
            d.getDate() === date.getDate() &&
            d.getMonth() === date.getMonth() &&
            d.getFullYear() === date.getFullYear()
        );
      if (highlightDate) {
        // check search for the informe with the date and check if it has a key, if it does, return bg-success else return bg-danger
        let practica = this.practicas.find((practica: any) => practica.id == id_practica);
        if (practica) {
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          const fechaParseada = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T12:00:00.000Z`;
          let informe = practica.informes.find((informe: any) => {

            if (informe.fecha == fechaParseada && informe.config_informe.tipo_informe != "informe final") {
              return true;
            }
            return false;
          });
          if (informe) {
            if (informe.key != null) {
              return 'bg-success';
            }
            else {
              return 'bg-warning';
            }
          }
        }
      }
      return '';
    };
  }

  comentarios(id_practica: any) {
    this.id_p = id_practica;
    let response: any = {};
    this.service_datos.obtener_comentarios_supervisor(this.id_p).subscribe({
      next: data => {
        response = { ...response, ...data }
      },
      error: error => {
        this._snackBar.open("Error al obtener comentarios", "Cerrar", {
          panelClass: ['red-snackbar'],
          duration: 2000
        });
      },
      complete: () => {
        console.log("Respuesta comentarios:", response.body.data.respuesta_supervisors);



        if (response.body.data.respuesta_supervisors.length == 0) {
          this.flag[response.body.data.id] = false;
        }
        else {
          this.flag[response.body.data.id] = true;
        }

        if (!this.resenas_supervisor.hasOwnProperty(id_practica)) {
          this.resenas_supervisor[id_practica] = [];
        }
        for (let i = 0; i < response.body.data.respuesta_supervisors.length; i++) {
          //por ahora solo se muestran las preguntas abiertas
          //agregar alternativas y preguntas evaluacion
          if (response.body.data.respuesta_supervisors[i].pregunta_supervisor.tipo_respuesta == "abierta") {
            let json = { pregunta: response.body.data.respuesta_supervisors[i].pregunta_supervisor.enunciado, respuesta: response.body.data.respuesta_supervisors[i].respuesta }
            this.resenas_supervisor[id_practica].push(json)
          }
        }
        console.log("Reseñas supervisor:", this.resenas_supervisor)
      }
    })
  }

  warning_practica() {
    this._snackBar.open("No puede finalizar la práctica hasta que subas todos los documentos solicitados", "Cerrar", {
      panelClass: ['red-snackbar'],
      duration: 2000
    });
  }

  eliminarArchivoInformeFinal(id_informe: any) {
    // show a dialog to confirm the action
    window.confirm("¿Está seguro que desea eliminar el informe final subido?");

    // if confirmed, delete the informe_final with the id_informe
    // if not confirmed, do nothing

    let respuesta: any = {};

    this.service_gestion.eliminar_informe_final(id_informe).subscribe({
      next: (data: any) => {
        respuesta = { ...respuesta, ...data }
      },
      error: (error: any) => console.log("Error en eliminar informe final:", error),
      complete: () => {
        //console.log("Respuesta eliminar informe final:",respuesta);
        this._snackBar.open("Informe final eliminado correctamente", "Cerrar", {
          panelClass: ['green-snackbar'],
          duration: 2000
        });
        // after 2 seconds reload the page
        setTimeout(() => {
          // check if the url has any query params, if it does, remove them
          let currentUrl = this.router.url;
          if (currentUrl.includes("?")) {
            currentUrl = currentUrl.split("?")[0];
            if (currentUrl.includes("%")) {
              currentUrl = currentUrl.split("%")[0];
            }
            window.location.href = currentUrl;
          }
          else {
            window.location.reload();
          }
        }
          , 2000);
      }
    });

  }
}


