import { Component, OnInit, ViewChild, Input, ElementRef, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DetallePracticaService } from 'src/app/servicios/encargado/detalle-practica.service';
import { SetDetallesAlumnoService } from '../../servicios/encargado/decision.service';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DataUsuarioService } from 'src/app/servicios/data_usuario/data-usuario.service';
import { FragmentosService } from '../../servicios/fragmentos/fragmentos.service';
import { ResumenService } from 'src/app/servicios/resumen/resumen.service';
import { InformeService } from 'src/app/servicios/informe/informe.service';
import jsPDF from 'jspdf';
// import htmlToPdfmake from 'html-to-pdfmake';
import e from 'express';
import { NotificacionesService } from 'src/app/servicios/notificaciones/notificaciones.service';
import { PlagioService } from "../../servicios/plagio/plagio.service";


@Component({
  selector: 'app-detalle-practica',
  templateUrl: './detalle-practica.component.html',
  styleUrls: ['./detalle-practica.component.css']
})
export class DetallePracticaComponent implements OnInit {
  //@ViewChild(DataTableDirective, { static: false })

  //@ViewChild('content', { static: false }) el!: ElementRef;

  @ViewChild('pdfTable') pdfTable: ElementRef;
  @ViewChild('pdfTable2') pdfTable2: ElementRef;

  //window.jsPDF = this.window.jspdf.jsPDF;

  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  id_practica: number;
  practica_terminada: boolean = false;

  practica: any = {};
  solicitudes_documentos: any = [];
  documento_extras: any = [];
  informes: any = [];
  informe_final: any = {};
  link_descarga_plantilla: string = "";
  link_descarga_informe: string = "";
  evaluaciones: any = [];
  respuestas_supervisor: any = {};
  data_supervisor_rdy: boolean = false;
  doc_str = "documento";
  doc_extra_str = "documento_extra";
  fragmentos_sup: any = [];
  respuestas_sup_parsed: any = [];
  hay_resumen: boolean = false;
  horas_totales: number = 0;

  preguntas_respuestas_informe: any = []

  botones_habilitados: boolean = false;

  id_estudiante: number = -1
  correo_estudiante: string = "";
  config_estudiante: string = "";

  preguntas: any = [];
  aptitudes_practica: any = [];
  notas_aptitudes: any = [];
  promedio: string = "";

  prom: number = -1;
  hay_respuesta: number = -1;
  ev_encargado: any = [];

  activada: boolean = true;
  correo_verificado: boolean = false;

  constructor(private fragmentosService: FragmentosService, private service: DetallePracticaService, private service2: SetDetallesAlumnoService,
    private _snackBar: MatSnackBar, private route: ActivatedRoute,
    private service_obtener: DataUsuarioService, private service_resumen: ResumenService, private service_informe: InformeService,
    private service_noti: NotificacionesService, private plagioService: PlagioService) {

    this.dtOptions = {
      language: {
        url: 'assets/localisation/es-es.json'
      },
      drawCallback: () => {
        //console.log(this.documentos);
      }
    };

    let respuesta: any = {};

    let id_practica = parseInt(this.route.snapshot.url[1].path); //obtener el id de práctica de la url
    this.id_practica = id_practica;

    if (!isNaN(id_practica)) {
      //====REQUEST para obtener la practica (con el estudiante, config_practica y otras tablas)====//
      this.service.obtener_practica(id_practica).subscribe({
        next: (data: any) => {
          respuesta = { ...respuesta, ...data }
        },
        error: (error: any) => {
          this.practica = [];
          this._snackBar.open("Error al solicitar datos de práctica", "Cerrar", {
            duration: 10000,
            panelClass: ['red-snackbar']
          });
        },
        complete: () => {
          this.practica = respuesta.body;
          if (this.practica.estado.toLowerCase() != "en curso") {
            this.practica_terminada = true;
          }

          this.check_resumen();

          this.activada = this.practica.modalidad.config_practica.activada;
          this.correo_verificado = this.practica.supervisor.es_correo_institucional;

          if (this.practica.ev_encargado == null) {
            this.ev_encargado = "-"
          } else {
            this.ev_encargado = this.practica.ev_encargado;
          }

          if (this.practica.estado == environment.estado_practica.evaluada ||
            this.practica.estado == environment.estado_practica.aprobada ||
            this.practica.estado == environment.estado_practica.reprobada) {
            this.botones_habilitados = true;
          }

          this.practica.consistencia_nota = this.practica.consistencia_nota ? `${Math.round(100 * this.practica.consistencia_nota)}%` : "—";
          this.practica.consistencia_informe = this.practica.consistencia_informe ? `${Math.round(100 * this.practica.consistencia_informe)}%` : "—";


          //make request to get solicitudes documentos in /todos_docs_practica
          this.service.obtener_solicitudes_documentos(this.practica.id, this.practica.modalidad.config_practica.id).subscribe({
            next: (data: any) => {
              respuesta = { ...respuesta, ...data }
            },
            error: (error: any) => {
              this.solicitudes_documentos = [];
              this._snackBar.open("Error al solicitar solicitudes de documentos", "Cerrar", {
                duration: 10000,
                panelClass: ['red-snackbar']
              });
            },
            complete: () => {
              this.solicitudes_documentos = respuesta.body;
            }
          });

          this.documento_extras = this.practica.documento_extras;
          this.informes = this.practica.informes;
          // considerar como evaluaciones todas las respuestas que tengan un tipo_respuesta que sea un número
          // this.evaluaciones = this.practica.respuesta_supervisors.filter((respuesta_supervisor: any) => {
          //   return !isNaN(respuesta_supervisor.respuesta);
          // });

          this.preguntas = this.practica.respuesta_supervisors


          for (var item of this.preguntas) {
            let temp: any = [];
            let nota_promedio = 0;
            let prom = 0;
            if (item.pregunta_supervisor != null) {
              if (item.pregunta_supervisor.tipo_respuesta == "evaluacion") {
                if (item.pregunta_supervisor.opciones.indexOf(";;") != -1) {
                  this.hay_respuesta = 1;
                  this.aptitudes_practica.push(item.pregunta_supervisor.opciones.split(";;"))
                  temp = item.respuesta.split(",");

                  for (var n of temp) {
                    nota_promedio += Number(n);
                    prom += 1;
                  }

                  this.notas_aptitudes.push(temp);
                  this.promedio = (nota_promedio / prom).toFixed(2)
                  break;
                }
              }
            }
          }

          // considerar como respuestas todas las que sean strings
          this.respuestas_supervisor = this.practica.respuesta_supervisors.filter((respuesta_supervisor: any) => {
            return isNaN(respuesta_supervisor.respuesta);
          });
          for (let i = 0; i < this.respuestas_supervisor.length; i++) {
            if (this.respuestas_supervisor[i].pregunta_supervisor.tipo_respuesta != "abierta") {
              let opciones = this.respuestas_supervisor[i].pregunta_supervisor.opciones.split(";;");
              let respuestas = this.respuestas_supervisor[i].respuesta.split(",");
              let respuestas_traducidas = "";
              for (let j = 0; j < opciones.length; j++) {
                if (respuestas[j] == "1") {
                  respuestas_traducidas += opciones[j] + ", ";
                }
              }
              respuestas_traducidas = respuestas_traducidas.slice(0, -2);
              //console.log(respuestas_traducidas);
              this.respuestas_supervisor[i].respuesta = respuestas_traducidas;
            }
          }
          this.get_fragmentos_sup(id_practica);
          this.id_estudiante = this.practica.estudiante.usuario.id;
          this.correo_estudiante = this.practica.estudiante.usuario.correo;
          this.config_estudiante = this.practica.estudiante.usuario.config;

          for (let i = 0; i < this.informes.length; i++) {
            if (this.informes[i]?.config_informe.tipo_informe == "informe final") {
              console.log("informe final: ", this.informes[i])
              this.informe_final = this.informes[i];
              if (this.informe_final.config_informe?.plantilla != null && this.informe_final.config_informe?.plantilla != "") {
                this.link_descarga_plantilla = "https://d2v9ocre132gvc.cloudfront.net/" + this.informe_final.config_informe.plantilla;
              }
              if (this.informe_final.key != null && Object.keys(this.informe_final.key).length > 0) {
                this.link_descarga_informe = "https://d2v9ocre132gvc.cloudfront.net/" + this.informe_final.key.filename;
              }
              // remove informe final from informes
              this.informes.splice(i, 1);
              break;
            }
            this.horas_totales += this.informes[i].horas_trabajadas;
          }




          if (this.practica.informes.length > 0) {

            // buscar si hay algun informe que haya sido respondido (su key es un objeto no vacío), obtener su indice dentro del arreglo
            let indice_informe_respondido = -1;
            for (let i = 0; i < this.practica.informes.length; i++) {
              if (this.practica.informes[i].key == null) continue;
              if (Object.keys(this.practica.informes[i].key).length > 0) {
                indice_informe_respondido = i;
                break;
              }
            }

            if (indice_informe_respondido != -1) {
              let key_informe_respondido = this.practica.informes[indice_informe_respondido].key;

              //console.log(key_informe_respondido)

              //obtener las respuestas de las preguntas del informe
              let lista_informes = Object.values(key_informe_respondido)
              //console.log(lista_informes)

              //obtener los ids de las preguntas del informe
              let keys = Object.keys(key_informe_respondido)
              //console.log(keys)

              let preguntas_informe: any = []

              for (let i = 0; i < keys.length; i++) {
                this.service_informe.get_pregunta_informe(Number(keys[i])).subscribe({
                  next: (data: any) => {
                    respuesta = { ...respuesta, ...data }
                  },
                  error: (error: any) => {
                    this._snackBar.open("Error al buscar configuracion de practica", "Cerrar", {
                      duration: 3000,
                      panelClass: ['red-snackbar']
                    });
                    console.log("Error al buscar configuracion de practica", error);
                  },
                  complete: () => {
                    preguntas_informe.push(respuesta.body)

                    if (i == keys.length - 1) {

                      //console.log(preguntas_informe)
                      //console.log(preguntas_informe.length)

                      //orednar preguntas informe
                      let preguntas_informe_ordenadas: any = []

                      for (let id of keys) {
                        for (let pregunta of preguntas_informe) {
                          if (pregunta.id == id) {
                            preguntas_informe_ordenadas.push(pregunta.enunciado)
                          }
                        }
                      }

                      //console.log("preguntas informe ordenadas")
                      //console.log(preguntas_informe_ordenadas)

                      let preguntas_respuestas_informes_aux = []

                      for (let i = 0; i < preguntas_informe_ordenadas.length; i++) {
                        preguntas_respuestas_informes_aux.push(preguntas_informe_ordenadas[i])
                        preguntas_respuestas_informes_aux.push(lista_informes[i])
                      }

                      //console.log("preguntas_respuestas_informes")
                      //console.log(preguntas_respuestas_informes_aux)

                      this.preguntas_respuestas_informe = preguntas_respuestas_informes_aux

                    }
                  }
                });
              }

            }
            //console.log(preguntas_informe)
          }

        }
      }); // fin request para obtener la practica  
    }
  }

  get_fragmentos_sup(id_practica: number) {
    console.log("respuestas_supervisor:");
    console.log(this.respuestas_supervisor);
    this.respuestas_sup_parsed = this.respuestas_supervisor.filter((elem: any) => {
      return elem.pregunta_supervisor.tipo_respuesta != "evaluacion"
    }).map((resp: any) => {
      return [true, resp.pregunta_supervisor.enunciado, resp.respuesta];
    });
    this.data_supervisor_rdy = true;
    console.log("respuestas_sup_parsed");
    console.log(this.respuestas_sup_parsed);
    // let dataFrag: any = {};
    // this.fragmentosService.update_fragmentos_practica(id_practica).subscribe({
    //   next: (data: any) => {
    //     dataFrag = { ...dataFrag, ...data };
    //   },
    //   error: (err: any) => { },
    //   complete: () => {
    //     console.log("dataFrag: ");
    //     console.log(dataFrag);
    //     if (!dataFrag.body || !dataFrag.body.supervisor) return;
    //     this.fragmentos_sup = dataFrag.body.supervisor

    //     this.respuestas_sup_parsed = this.respuestas_supervisor.filter((elem: any) => {
    //       return elem.pregunta_supervisor.tipo_respuesta != "evaluacion"
    //     }).map((resp: any) => {
    //       // if (!(resp.id in this.fragmentos_sup)) {
    //       //   return [true, resp.pregunta_supervisor.enunciado, resp.respuesta]
    //       // } else if (this.fragmentos_sup[resp.id].length == 0) {
    //       //   return [true, resp.pregunta_supervisor.enunciado, resp.respuesta]
    //       // } else {
    //       //   let palabras = resp.respuesta.split(" ");
    //       //   return [
    //       //     false,
    //       //     resp.pregunta_supervisor.enunciado,
    //       //     [
    //       //       palabras.slice(0, this.fragmentos_sup[resp.id][0].fragmento[0]).join(" ").trim(),
    //       //       palabras.slice(this.fragmentos_sup[resp.id][0].fragmento[0], this.fragmentos_sup[resp.id][0].fragmento[1] + 1).join(" ").trim(),
    //       //       palabras.slice(this.fragmentos_sup[resp.id][0].fragmento[1] + 1, palabras.length).join(" ").trim()
    //       //     ]
    //       //   ]
    //       // }
    //     });
    //     this.data_supervisor_rdy = true;
    //   }
    // });
  }

  generar_resumen() {
    let bot_inf = document.getElementById("boton_informe") as HTMLElement;
    let bot_sup = document.getElementById("boton_supervisor") as HTMLElement;
    bot_inf.innerHTML = `
    <div class="spinner-border" role="status">
      <span class="sr-only">Loading...</span>
    </div>
    `
    bot_sup.innerHTML = `
    <div class="spinner-border" role="status">
      <span class="sr-only">Loading...</span>
    </div>
    `

    let data: any = {};
    if (this.practica.resumen && Object.keys(this.practica.resumen).length > 0) {
      this.hay_resumen = true;
      return;
    }
    this.service_resumen.get_informe_preguntas(this.practica.id).subscribe({
      next: (_data: any) => {
        data = { ...data, ..._data };
      },
      complete: () => {
        //console.log(data.body)
        if (!data.body) {
          this._snackBar.open("Error al solicitar resumen, por favor vuelva más tarde", "Cerrar", {
            panelClass: ['red-snackbar'],
            duration: 3000
          });
          return;
        }
        if (!data.body.informe)
          data.body.informe = "No hay información disponible."
        if (!data.body.supervisor)
          data.body.supervisor = "No hay información disponible."
        this.practica.resumen = data.body;
        this.hay_resumen = true;
      },
      error: (error: any) => {
        console.error(error);
        this._snackBar.open("Error al solicitar resumen, por favor vuelva más tarde", "Cerrar", {
          panelClass: ['red-snackbar'],
          duration: 3000
        });
      }
    });
  }




  /*
  downloadAsPDF(){
    console.log("generando pdf")
    let pdf = new jsPDF('l', 'pt', 'a3');

    const pdfTable = this.pdfTable2.nativeElement;

    pdf.html(this.pdfTable2.nativeElement, {
      callback: (doc) => {
        doc.save("resumen.pdf");
      }
    });
    //console.log(pdfTable.innerHTML)
    //var html = htmlToPdfmake(pdfTable.innerHTML);

    //const documentDefinition = { content: html };
    
    //let PDF_doc: any = { documentDefinition };
    
  }
  */



  generar_pdf_resumen() {

    let cantidad_paginas = 1

    console.log("generando pdf")
    let pdf = new jsPDF();

    //console.log(this.id_estudiante)
    pdf.setFontSize(20);
    //console.log(this.practica)

    pdf.text("Resumen " + this.practica.modalidad.config_practica.nombre, 15, 20);
    pdf.setFontSize(15);
    pdf.text(String(this.practica.estudiante.usuario.nombre), 15, 35);
    pdf.text("Resultado de práctica: " + this.practica.estado, 15, 45);
    pdf.text("Correo: " + this.practica.estudiante.usuario.correo, 15, 55);
    pdf.text("Empresa: " + this.practica.empresa.nombre_empresa, 15, 65);
    pdf.text("Supervisor: " + this.practica.supervisor.nombre, 15, 75);
    pdf.text("Correo supervisor: " + this.practica.supervisor.correo, 15, 85);

    //borrar desde caracter T en adelante de la fecha
    let fecha_inicio = this.practica.fecha_inicio.split("T")[0];
    let fecha_termino = this.practica.fecha_termino.split("T")[0];

    pdf.text("Fecha de inicio: " + fecha_inicio, 15, 95);
    pdf.text("Fecha de término: " + fecha_termino, 15, 105);
    //pdf.text("hola", 200, 20);

    pdf.text("Informes del alumno: ", 15, 120);

    pdf.setFontSize(13);

    //console.log(this.practica.informes[0])


    //let preguntas_informe[] = []

    //console.log(Object.values(this.practica.informes[0].key).length)

    //let keys = Object.keys(this.practica.informes[0].key)

    let linea_actual = 0

    let continuar_desde = 130

    //let respuesta: any = {}

    //let pregunta = ""

    //console.log(keys)

    //console.log(this.preguntas_respuestas_informe)

    for (let i = 0; i < this.preguntas_respuestas_informe.length; i++) {
      var palabras_informe = this.preguntas_respuestas_informe[i].split(" ")
      //console.log(palabras_informe)
      var lista_aux = []

      var aux_string = "- "
      for (let x = 0; x < palabras_informe.length; x++) {

        //console.log(aux_string)
        if (x % 10 == 0 && x != 0) {
          aux_string += (palabras_informe[x] + " ")
          lista_aux.push(aux_string)
          aux_string = ""
        }
        else if (x == palabras_informe.length - 1) {
          aux_string += (palabras_informe[x] + " ")
          lista_aux.push(aux_string)
        }

        else {
          aux_string += (palabras_informe[x] + " ")
        }
      }

      for (let j = 0; j < lista_aux.length; j++) {
        if (cantidad_paginas == 1 && 130 + i * 5 + linea_actual * 10 > 260) {
          pdf.addPage()
          continuar_desde = 20
          linea_actual = 0
          cantidad_paginas += 1
        }
        else if (cantidad_paginas > 1 && i * 5 + linea_actual * 10 > 260) {
          pdf.addPage()
          continuar_desde = 20
          linea_actual = 0
        }
        pdf.text(lista_aux[j], 15, continuar_desde + i * 5 + linea_actual * 10);
        linea_actual += 1
      }
    }

    pdf.save("resumen.pdf");
    /*


    for (let i = 0; i < keys.length; i++) {

    //for (let i = 0; i < keys.length; i++) {

      //console.log("pregunta con id: ", keys[i])
      this.service_informe.get_pregunta_informe(Number(keys[i])).subscribe({
        next: (data: any) => {
          respuesta = { ...respuesta, ...data }
      },
      error: (error: any) => {
          this._snackBar.open("Error al buscar configuracion de practica", "Cerrar", {
          duration: 3000,
          panelClass: ['red-snackbar']
          });
          console.log("Error al buscar configuracion de practica", error);
      },
      complete: () => {
          console.log("enunciado: ", respuesta.body.enunciado)
          pregunta = respuesta.body.enunciado
      
        var palabras_pregunta = pregunta.split(" ")
        //var lista_aux_pregunta = []

        console.log(palabras_pregunta)

        

        var aux_string = "- "
        for(let p = 0; p<palabras_pregunta.length; p++){  
          if (p%10 == 0 && p != 0){
            aux_string += (palabras_pregunta[p] + " ")
            lista_aux_pregunta.push(aux_string)
            aux_string = ""
            }
          else if(p == palabras_pregunta.length - 1){
            aux_string += (palabras_pregunta[p] + " ")
            lista_aux_pregunta.push(aux_string)
          }
          else{
            aux_string += (palabras_pregunta[p] + " ")
          }
        }

        for (let j = 0; j < lista_aux_pregunta.length; j++) {
          if (130 + i*5 + linea_actual*10 > 260){
            pdf.addPage()
            continuar_desde = 20
            linea_actual = 0
          }
          pdf.text(lista_aux_pregunta[j], 15, continuar_desde + i*5 + linea_actual*10);
          linea_actual += 1
        }

        

        // IMPRIMIER INFORME

        var informe = String(this.practica.informes[0].key[keys[i]])
        var palabras_informe = informe.split(" ")
        //var lista_cantidad_palabras = []
        //var cantidad_caracteres = 0
        //var cantidad_palabras = 0
        console.log(palabras_informe)

        var lista_aux = []

        var aux_string = "- "
        for (let x = 0; x < palabras_informe.length; x++) {

          //console.log(aux_string)
          if (x%10 == 0 && x != 0){
            aux_string += (palabras_informe[x] + " ")
            lista_aux.push(aux_string)
            aux_string = ""
          }
          else if(x == palabras_informe.length - 1){
            aux_string += (palabras_informe[x] + " ")
            lista_aux.push(aux_string)
          }

          else{
            aux_string += (palabras_informe[x] + " ")
          }
        }

        //console.log(lista_aux)


        for (let j = 0; j < lista_aux.length; j++) {
          if (130 + i*5 + linea_actual*10 > 260){
            pdf.addPage()
            continuar_desde = 20
            linea_actual = 0
          }
          pdf.text(lista_aux[j], 15, continuar_desde + i*5 + linea_actual*10);
          linea_actual += 1
        }

        if (i == keys.length - 1){
          pdf.save("resumen.pdf");
        }

      }

      });

    }
    //pdf.save("resumen.pdf");
    */
  }

  ngOnInit() {
  }

  check_resumen() {
    if (!this.practica.resumen) {
      this.hay_resumen = false;
      return
    }
    if (Object.keys(this.practica.resumen).length == 2) {
      this.hay_resumen = true;
    } else if (Object.keys(this.practica.resumen).length == 1) {
      if (!this.practica.resumen.informe) {
        this.practica.resumen.informe = "No hay información disponible."
      } else {
        this.practica.resumen.supervisor = "No hay información disponible."
      }
      this.hay_resumen = true;
    } else {
      this.hay_resumen = false;
    }
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next(0);
    });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(0);
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  isDataEmpty(data: any): boolean {
    if (data == null || data == undefined) return true;
    return Object.keys(data).length === 0 && data.constructor === Object;
  }

  aprobar(id_usuario: number, id_estudiante: number, id_modalidad: number, aprobacion: 0 | 1) {
    let respuesta: any = {}
    let mensaje: string = "";
    if (aprobacion == 1) {
      mensaje = "Felicidades, has aprobado esta práctica";
    }
    else {
      mensaje = "Desafortunadamente, has reprobado esta práctica";
    }
    this.service2.aprobar_practica(id_estudiante, id_modalidad, aprobacion).subscribe({
      next: (data: any) => {
        respuesta = { ...respuesta, ...data }
      },
      error: (error: any) => console.log(error),
      complete: () => {
        if (respuesta.status == 200) {
          this._snackBar.open("Práctica actualizada", "Cerrar", {
            panelClass: ['green-snackbar'],
            duration: 2000
          });
        } else {
          this._snackBar.open("Se ha producido un error", "Cerrar", {
            panelClass: ['red-snackbar']
          });
        }
        respuesta = {};
        let enlace: string = environment.url_front + "/alumno/" + id_usuario;
        this.service_noti.postnotificacion(id_usuario, mensaje, this.correo_estudiante, this.config_estudiante, enlace).subscribe({
          next: (data: any) => {
            respuesta = { ...respuesta, ...data };
          },
          error: (error: any) => {
            console.log(error);
            return;
          },
          complete: () => {
            //console.log("Notificación enviada con éxito");
            window.location.reload()
          }
        });
        // setTimeout(() => {
        //   //window.location.reload();
        //   window.location.reload();
        // }
        //   , 2000);
      }
    });
  }

  descargar_documento(documento_id: string, solicitud_tipo: string) {
    // abrir nueva pestaña con url de descarga, que es url_backend (sacada desde el env) + /documentos/ + documento_key
    if (solicitud_tipo == "documento") {
      window.open(environment.url_back + "/documento/download?id=" + documento_id, "_blank");
    }
    else {
      window.open(environment.url_back + "/documento_extra/download?id=" + documento_id, "_blank");
    }
  }

  mostrar_informe(informe_id: string) {
    // abrir una ventana modal que muestre el texto del informe
    let informe = this.informes.find((informe: any) => informe.id == informe_id);
    if (informe) {
      // abrir una ventana pequeña que muestre el texto del informe dentro de un textarea
      let ventana = window.open("", "_blank", "width=800,height=400");
      if (!ventana) {
        alert("Por favor, deshabilite el bloqueador de ventanas emergentes para este sitio");
      }
      else {
        ventana.document.write("<textarea style='width: 100%; height: 100%; resize: none; border: none;'>" + informe.key + "</textarea>");
      }
    }
  }



}
