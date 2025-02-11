import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { DataUsuarioService } from 'src/app/servicios/data_usuario/data-usuario.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones/notificaciones.service';
import { DatePipe } from '@angular/common';

import * as dayjs from 'dayjs'
dayjs().format()
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

@Component({
  selector: 'app-barra-superior',
  templateUrl: './barra-superior.component.html',
  styleUrls: ['./barra-superior.component.scss']
})
export class BarraSuperiorComponent implements OnInit {
  es_alumno: number = -1;
  tipo: string = "";
  id_usuario: number = 0;
  respuesta: any = [];
  nombre_usuario: string = "";

  personas: any = [];
  id_personas: any = [];

  id_persona: number = 0;
  estado_config: string = "";

  notificaciones: any = [];

  estados_configuracion = [{ nombre: "Notificaciones y Correo", seleccionado: false },
  { nombre: "Sólo Notificaciones", seleccionado: false },
  { nombre: "Sólo Correo", seleccionado: false },
  { nombre: "Ninguno", seleccionado: false }];

  constructor(private Service: DataUsuarioService,
    private service_noti: NotificacionesService,
    private cdr: ChangeDetectorRef,
    private datetime: DatePipe, private router: Router) {
    // get user id from the local storage, in the key auth-user, userdata.id
    let auth_user = JSON.parse(localStorage.getItem("auth-user") || "{}");
    //console.log("Auth User:", auth_user);
    if (auth_user.userdata != undefined) {
      let userdata = auth_user.userdata;
      //console.log("Userdata:", userdata);
      if (userdata.id != undefined) {
        this.id_usuario = userdata.id;

        this.Service.obtener_usuario(this.id_usuario).subscribe({
          next: (data: any) => {
            this.respuesta = { ...this.respuesta, ...data }
          },
          error: (error: any) => {
            //console.log(error);
            return;
          },
          complete: () => {
            //console.log("RESPUESTA:",this.respuesta);
            this.nombre_usuario = this.respuesta.body.nombre;
            this.estado_config = this.respuesta.body.config;
            for (let i = 0; i < this.estados_configuracion.length; i++) {
              if (this.estados_configuracion[i].nombre == this.estado_config) {
                this.estados_configuracion[i].seleccionado = true;
              }
            }

            //console.log("ESTADO ACTUAL",this.estado_config)
            //console.log("estados::::",this.estados_configuracion,)
            cdr.detectChanges();
          }
        });
      }
    }
    this.service_noti.callback.subscribe(res => {
      let fechaF = res.fecha

      //console.log(fechaF);
      let mensaje = res.message;
      //console.log("EL ESTADO ACTUAL ES", this.estado_config);
      if (this.estado_config == "Notificaciones y Correo" || this.estado_config == "Sólo Notificaciones") {
        //console.log("Notificacion recibida2, el mensaje es", mensaje);
        this.notificaciones.push({ fecha: fechaF, texto: mensaje, link: res.link });
      }
      this.cdr.detectChanges();
    })

  }

  cambiar_configuracion_notificacion(Id: number, estado: string) {
    this.service_noti.cambiar_configuración_notificaciones(Id, estado).subscribe({
      next: (data: any) => {
        this.respuesta = { ...this.respuesta, ...data };
      },
      error: (error: any) => {
        console.log(error);
        return;
      },
      complete: () => {
        //console.log("Estado cambiado con éxito");
        this.respuesta = [];
        this.estado_config = estado;
      }
    })
  }

  obtener_personas(ID: number, IS: number) {
    if (IS == 1) {
      this.Service.obtener_encargados_practicas(ID).subscribe({
        next: (data: any) => {
          this.respuesta = { ... this.respuesta, ...data }
        },
        error: (error: any) => {
          console.log(error);
          return;
        },
        complete: () => {
          //console.log("respuesta", this.respuesta)
          
          // Se muestran todos los encargados en la misma carrera que el estudiante
          if (this.respuesta.body.hasOwnProperty("carrera") == true){
            if (this.respuesta.body.carrera.hasOwnProperty("encargados") == true){
              this.personas = this.respuesta.body.carrera.encargados;
            }
          }
          
          this.respuesta = [];
          //console.log("ENCARGADOS:",this.personas);
        }
      })
    }
    else {
      this.Service.obtener_estudiantes_practicas(ID).subscribe({
        next: (data: any) => {
          this.respuesta = { ... this.respuesta, ...data }
        },
        error: (error: any) => {
          console.log(error);
          return;
        },
        complete: () => {
          //console.log("respuesta", this.respuesta)
          
          // Se muestran todos los encargados en la misma carrera que el estudiante
          if (this.respuesta.body.hasOwnProperty("carrera") == true){
            if (this.respuesta.body.carrera.hasOwnProperty("estudiantes") == true){
              this.personas = this.respuesta.body.carrera.estudiantes;
            }
          }
          
          this.respuesta = [];
          //console.log("ENCARGADOS:",this.personas);
        }
      })
    }
  }

  ngOnInit(): void {
    //console.log(this.id_usuario);
    //console.log(this.estado_config);

    /*
    if(this.estado_config == "Correos y Notificaciones" || this.estado_config == "Sólo Notificaciones"){
      this.Service.obtener_notificaciones(this.id_usuario, this.estado_config).subscribe({
        next: (data:any) => {
          this.respuesta = { ...this.respuesta, ...data}
        },
        error: (error: any) => {
          console.log(error);
        },
        complete: () => {
          this.notificaciones = this.respuesta.body;
          this.notificaciones = this.notificaciones.map((notificacion:any ) => {
            notificacion.fecha = dayjs(notificacion.fecha, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm");
            return notificacion;
          });
          this.respuesta = [];
        }
      })
    }
    */

    this.Service.obtener_usuario(this.id_usuario).subscribe({
      next: (data: any) => {
        this.respuesta = { ...this.respuesta, ...data }
      },
      error: (error: any) => {
        console.log(error);
        return;
      },
      complete: () => {
        this.estado_config = this.respuesta.body.config
        //console.log(this.estado_config)

        if (this.estado_config == "Notificaciones y Correo" || this.estado_config == "Sólo Notificaciones") {
          this.Service.obtener_notificaciones(this.id_usuario, this.estado_config).subscribe({
            next: (data: any) => {
              this.respuesta = { ...this.respuesta, ...data }
            },
            error: (error: any) => {
              console.log(error);
            },
            complete: () => {
              let aux: Array<any> = this.respuesta.body.map((notificacion: any) => {
                notificacion.fecha_og = notificacion.fecha;
                notificacion.fecha = dayjs(notificacion.fecha, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm");
                return notificacion;
              });
              aux.sort(function (a: any, b: any): number {
                if (a.fecha_og > b.fecha_og) return -1;
                if (a.fecha_og < b.fecha_og) return 1;
                return 0;
              })
              this.notificaciones = aux

              this.respuesta = [];
            }
          })
        }

        if (this.respuesta.body.es_estudiante == true) {
          this.es_alumno = 1;
          this.Service.obtener_estudiante(this.id_usuario).subscribe({
            next: (data: any) => {
              this.respuesta = { ...this.respuesta, ...data }
            },
            error: (error: any) => {
              console.log(error);
              return;
            },
            complete: () => {
              this.id_persona = this.respuesta.body.id;
              this.obtener_personas(this.id_persona, this.es_alumno);
            }
          })
        }
        else if (this.respuesta.body.es_encargado == true) {
          this.es_alumno = 0;
          this.Service.obtener_encargado(this.id_usuario).subscribe({
            next: (data: any) => {
              this.respuesta = { ...this.respuesta, ...data }
            },
            error: (error: any) => {
              console.log(error);
              return;
            },
            complete: () => {
              this.id_persona = this.respuesta.body.id;
              this.obtener_personas(this.id_persona, this.es_alumno);
            }
          })
        }
        else {
          return;
        }
        this.respuesta = [];
      }
    });

    /*
    if(this.estado_config == "Correos y Notificaciones" || this.estado_config == "Sólo Notificaciones"){
      this.Service.obtener_notificaciones(this.id_usuario, this.estado_config).subscribe({
        next: (data:any) => {
          this.respuesta = { ...this.respuesta, ...data}
        },
        error: (error: any) => {
          console.log(error);
        },
        complete: () => {
          this.notificaciones = this.respuesta.body;
          this.notificaciones = this.notificaciones.map((notificacion:any ) => {
            notificacion.fecha = dayjs(notificacion.fecha, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm");
            return notificacion;
          });
          this.respuesta = [];
        }
      })
    }
    */
    //console.log(this.personas);
  }

  eliminar_notificaciones(id: number) {
    this.service_noti.notificaciones_vistas(id).subscribe({
      next: (data: any) => {
        this.respuesta = { ...this.respuesta, ...data };
      },
      error: (error: any) => {
        console.log(error);
        return;
      },
      complete: () => {
        this.notificaciones = [];
        //console.log("Notificaciones cambiadas");
        this.respuesta = [];
      }
    })
  }
  redirect_to_chat(userid_otro_participante:number, tipo:string){
    
    if(tipo=="encargado"){
      if (this.router.url.includes("chat/sala")){
        this.router.navigate(['/chat/sala'+userid_otro_participante+this.id_usuario+"/"+this.id_usuario+"/"+userid_otro_participante+"/encargado"]);
        // reload the page after 1 second
        setTimeout(() => {
          window.location.reload(); // esto es porque si ya se estaba en un chat, no recargaba los mensajes
        }
        , 300);
      }
      else{
        this.router.navigate(['/chat/sala'+userid_otro_participante+this.id_usuario+"/"+this.id_usuario+"/"+userid_otro_participante+"/encargado"]);
      }
    }
    else if(tipo=="estudiante"){
      if (this.router.url.includes("chat/sala")){
        this.router.navigate(['/chat/sala'+this.id_usuario+userid_otro_participante+"/"+this.id_usuario+"/"+userid_otro_participante+"/estudiante"]);
        // reload the page after 1 second
        setTimeout(() => {
          window.location.reload(); // esto es porque si ya se estaba en un chat, no recargaba los mensajes
        }
        , 300);
      }
      else{
        this.router.navigate(['/chat/sala'+this.id_usuario+userid_otro_participante+"/"+this.id_usuario+"/"+userid_otro_participante+"/estudiante"]);
      }
    }
  }
}
