import { Component } from '@angular/core';
import { SupervisorService } from '../../servicios/supervisor/supervisor.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from "@angular/router"
import * as $ from 'jquery';

@Component({
  selector: 'evaluacion_supervisor',
  templateUrl: './evaluacion_supervisor.component.html',
  styleUrls: ['./evaluacion_supervisor.component.scss']
})
export class EvaluacionComponent {

  id_config_practica = -1;
  practica: any = {};
  preguntas: any[] = [];
  pregunta_actual = 0;
  tipo_respuestas: any[] = [];
  boton_comenzar_deshabilitado = true;

  // Aqui se guardan temporalmente las respuestas mientras se llena el formulario. Estas se procesan antes de enviarlas al backend.
  respuestas: any[] = [];

  aptitudes_evaluacion: any = [];

  rango_aptitudes: number;
  array_rango_aptitudes: any = [];


  constructor(private service_supervisor: SupervisorService, private _snackbar: MatSnackBar, private router: Router, private activated_route: ActivatedRoute) { }

  isAnimating = false; // Flag to indicate whether an animation is in progress
  izq() {
    if (this.isAnimating) {
      return; // Don't allow animation if one is already in progress
    }

    let id = `#cont_respuesta${this.pregunta_actual}`;
    let id_izq = `#cont_respuesta${this.pregunta_actual - 1}`;

    this.isAnimating = true; // Set the flag

    $(id).fadeOut(() => {
      $(id).css("display", "none");
      $(id_izq).css({ "display": "block" });
      $(id_izq).fadeIn(() => {
        this.isAnimating = false; // Reset the flag when animation is complete
      });
      this.pregunta_actual -= 1;
    });
  }

  der() {
    if (this.isAnimating) {
      return; // Don't allow animation if one is already in progress
    }

    let id = `#cont_respuesta${this.pregunta_actual}`;
    let id_der = `#cont_respuesta${this.pregunta_actual + 1}`;

    this.isAnimating = true; // Set the flag

    $(id).fadeOut(() => {
      $(id).css("display", "none");
      $(id_der).css({ "display": "block" });
      $(id_der).fadeIn(() => {
        this.isAnimating = false; // Reset the flag when animation is complete
      });
      this.pregunta_actual += 1;
    });
  }

  ngOnInit(): void {
    //obtain id_practica from url
    let token = "";
    let iv = "";
    let practica = { body: {} };
    let response: any = {};

    this.activated_route.queryParams.subscribe(params => {
      token = params['token'];
      iv = params['iv'];
    });

    this.service_supervisor.getPractica(token, iv).subscribe({
      next: (data: any) => {
        practica = { ...practica, ...data };
      },
      error: (error: any) => {
        console.log(error);
        this._snackbar.open("Error al obtener la práctica", "Cerrar", {
          duration: 2000,
          panelClass: ['red-snackbar']
        });
      },
      complete: () => {
        this.practica = practica.body;
        //console.log("PRACTICA OBTENIDA", practica);
        if (this.practica.hasOwnProperty('estado') && this.practica.estado == "Evaluada" ||
          this.practica.estado == "Aprobada" || this.practica.estado == "Reprobada") {
          this._snackbar.open("Error: la práctica ya ha sido evaluada.", "Cerrar", {
            duration: 3000,
            panelClass: ['red-snackbar']
          });
          setTimeout(() => {
            this.router.navigate(['/']);
            return;
          }, 2000);
        }
        else {
          this.boton_comenzar_deshabilitado = false;
        }

        if (this.practica.hasOwnProperty('modalidad') && this.practica.modalidad.hasOwnProperty('id_config_practica')) {
          this.id_config_practica = this.practica.modalidad.id_config_practica
          if (this.practica.modalidad.config_practica.hasOwnProperty('pregunta_supervisors')) {
            this.preguntas = this.practica.modalidad.config_practica.pregunta_supervisors;
            if (this.preguntas.length > 0) {
              console.log(0)
              for (let pregunta of this.preguntas) {
                console.log(pregunta.opciones)
                if (pregunta.tipo_respuesta == "casillas") {
                  let array_aux = [];
                  for (let i = 0; i < pregunta.opciones.split(";;").length; i++) {
                    array_aux.push(false);
                  }
                  this.respuestas.push(array_aux);
                }
                //CAMBIOS PREGUNTA EVALUACION
                else if (pregunta.tipo_respuesta == "evaluacion") {

                  let array_aux_evaluacion = [];
                  let array_aux_aptitudes = pregunta.opciones.split(";;");
                  this.aptitudes_evaluacion = array_aux_aptitudes;
                  this.rango_aptitudes = pregunta.rango;
                  console.log("RANGO APTITUDES", this.rango_aptitudes);
                  this.array_rango_aptitudes = Array.from({ length: this.rango_aptitudes }, (_, i) => i + 1);


                  for (let i = 0; i < pregunta.opciones.split(";;").length; i++) {
                    array_aux_evaluacion.push(-1);
                  }
                  this.respuestas.push(array_aux_evaluacion);
                }
                else {
                  this.respuestas.push("");
                }
                this.tipo_respuestas.push(pregunta.tipo_respuesta);
              }

            }
            else {
              this._snackbar.open("Error: la práctica no tiene preguntas asociadas.", "Cerrar", {
                duration: 2000,
                panelClass: ['red-snackbar']
              });
              return;
            }
          }
          else {
            this._snackbar.open("Error: la práctica no tiene preguntas asociadas.", "Cerrar", {
              duration: 2000,
              panelClass: ['red-snackbar']
            });
            return;
          }
        }
        else {
          this._snackbar.open("Error: la práctica no tiene configuración asociada.", "Cerrar", {
            duration: 2000,
            panelClass: ['red-snackbar']
          });
          return;
        }
      }
    });
  }

  updateRespuestasAbierta(index: number, value: string) {
    //console.log("UPDATEANDO RESPUESTAS abierta", value)
    this.respuestas[index] = value;
    //console.log(this.respuestas);
  }

  updateRespuestasCasillas(i: number, j: number, value: string) {
    //console.log("UPDATEANDO RESPUESTAS casillas", value)
    this.respuestas[i][j] = value;
    //console.log(this.respuestas);
  }

  updateRespuestasAlternativas(i: number, value: string) {
    //console.log("UPDATEANDO RESPUESTAS alternativas", value);
    this.respuestas[i] = value;
    //console.log(this.respuestas);
  }

  updateRespuestasEvaluacion(index_pregunta: number, index_aptitud: number, value: number) {
    //console.log("UPDATEANDO RESPUESTAS evaluacion", value);
    //this.respuestas[index_pregunta][index_aptitud] = value;
    //console.log(this.respuestas);

    //console.log("RESPUESTAS", this.respuestas);


    //console.log("respuesta actual evaluacion");
    //console.log(this.respuestas)
  }

  range(n: number): any[] {
    let range = [];
    for (let i = 1; i <= n; i++) {
      range.push(i);
    }
    return range;
  }

  enviarEvaluacion() {
    console.log("Enviando evaluación...")
    let respuestas_aux = [];
    let ids_preguntas = [];

    // chequear que se hayan respondido todas las preguntas
    for (let i = 0; i < this.respuestas.length; i++) {
      if (this.respuestas[i] == "" || this.respuestas[i] == -1 || this.respuestas[i].length == 0) {
        this._snackbar.open("Error: no se han respondido todas las preguntas.", "Cerrar", {
          duration: 2000,
          panelClass: ['red-snackbar']
        });
        return;
      }
    }

    // procesamiento de respuestas para convertirlas al formato acordado para el backend
    for (let i = 0; i < this.respuestas.length; i++) {
      let respuesta_aux = "";
      if (this.tipo_respuestas[i] == "casillas") {
        for (let j = 0; j < this.respuestas[i].length; j++) {
          if (this.respuestas[i][j]) {
            respuesta_aux += "1";
          }
          else {
            respuesta_aux += "0";
          }
          if (j != this.respuestas[i].length - 1) {
            respuesta_aux += ",";
          }
        }
      }
      else if (this.tipo_respuestas[i] == "evaluacion") {
        for (let j = 0; j < this.respuestas[i].length; j++) {
          respuesta_aux += String(this.respuestas[i][j]);
          respuesta_aux += ",";
        }
        respuesta_aux = respuesta_aux.slice(0, -1);
      }
      else if (this.tipo_respuestas[i] == "alternativas") {
        let index = this.preguntas[i].opciones.split(";;").indexOf(this.respuestas[i]);
        for (let j = 0; j < this.preguntas[i].opciones.split(";;").length; j++) {
          if (j == index) {
            respuesta_aux += "1";
          }
          else {
            respuesta_aux += "0";
          }
          if (j != this.preguntas[i].opciones.split(";;").length - 1) {
            respuesta_aux += ",";
          }
        }
      }
      else {
        respuesta_aux = this.respuestas[i];
      }
      respuestas_aux.push(respuesta_aux);
      ids_preguntas.push(this.preguntas[i].id);
    }
    // enviar respuestas al backend
    this.service_supervisor.sendAnswer(ids_preguntas, this.practica.id, respuestas_aux).subscribe({
      next: (data: any) => {
      },
      error: (error: any) => {
        console.log(error);
        this._snackbar.open("Error al enviar la respuesta", "Cerrar", {
          duration: 2000,
          panelClass: ['red-snackbar']
        });
      },
      complete: () => {
        this._snackbar.open("Evaluación enviada. Redirigiendo a página principal...", "Cerrar", {
          duration: 3000,
          panelClass: ['green-snackbar']
        });
        setTimeout(() => {
          this.router.navigate(['/']);
          return;
        }, 2000);
        // after 2 seconds, redirect to home
        // this.service_supervisor.setFragmentos(this.practica.id, { }).subscribe({
        //   next: (data: any) => {
        //   },
        //   error: (error: any) => {
        //     console.log(error);
        //     this._snackbar.open("Error al enviar la respuesta", "Cerrar", {
        //       duration: 2000,
        //       panelClass: ['red-snackbar']
        //     });
        //   },
        //   complete: () => {
        //     this.service_supervisor.setRepeticiones(this.practica.id).subscribe({
        //       next: (data: any) => {
        //       },
        //       error: (error: any) => {
        //         console.log(error);
        //         this._snackbar.open("Error al enviar la respuesta", "Cerrar", {
        //           duration: 2000,
        //           panelClass: ['red-snackbar']
        //         });
        //       },
        //       complete: () => {
        //         setTimeout(() => {
        //           this.router.navigate(['/']);
        //           return;
        //         }, 2000); 
        //       }
        //     });
        //   }
        // });

      }
    });
  }
}
