import { Component } from '@angular/core';
import { DataUsuarioService } from 'src/app/servicios/data_usuario/data-usuario.service';
import { UsuarioService } from 'src/app/servicios/usuario/usuario.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent {
  esalumno: number = -1;
  ID: number = -1;
  usuario: any = {};
  historial: any = [];
  respuesta: any = [];

  Nombre: string = "";
  Correo: string = "";
  Rut: string = "";
  Carrera: string = "";
  id_carrera: number = -1;
  Link: string = "";
  NLink: string = "";
  edicion1: number = 0;
  edicion2: number = 0;

  carreras: any = [];

  constructor(private service: DataUsuarioService, private user_service: UsuarioService) {
    this.usuario = JSON.parse(localStorage.getItem('auth-user') || '{}').userdata;
    if (this.usuario.es_estudiante == 1) {
      this.esalumno = 1;
      this.ID = this.usuario.estudiante.id;
    }
    else {
      this.esalumno = 0;
    }

    this.Nombre = this.usuario.nombre;
    this.Correo = this.usuario.correo;

    if (this.esalumno == 1) {
      this.Rut = this.usuario.estudiante.rut;

      this.service.obtener_estudiante(this.usuario.estudiante.id_usuario).subscribe({
        next: (data: any) => {
          this.respuesta = { ...this.respuesta, ...data };
        },
        error: (error: any) => {
          console.log(error);
          return;
        },
        complete: () => {
          console.log("respuesta", this.respuesta);
          this.Link = this.Link = this.respuesta.body.perfil_linkedin || "";
          this.id_carrera = this.respuesta.body.id_carrera;
          this.respuesta = {}
          this.user_service.get_carreras().subscribe({
            next: (data: any) => {
              this.respuesta = { ...this.respuesta, ...data };
            },
            error: (error: any) => {
              return;
            },
            complete: () => {
              console.log("respuesta", this.respuesta);
              for (var val of this.respuesta.body) {
                this.carreras.push(val);
              }
              for (let carrera of this.carreras) {
                if (carrera.id == this.id_carrera) {
                  this.Carrera = carrera.nombre
                  break;
                }
              }
            }
          });
        }
      })
    }
  }

  volver_atras() {
    window.history.back();
  }

  editar1() {
    this.edicion1 = 1;
  }

  editar2() {
    this.edicion2 = 1;
  }


  confirmar_cambio_link() {
    this.Link = this.NLink
    this.NLink = "";

    this.service.cambiar_correo_linkedin(this.ID, this.Link).subscribe({
      next: (data: any) => {

      },
      error: (error: any) => {
        console.log(error);
        return;
      },
      complete: () => {
        this.edicion1 = 0;
      }
    })
  }

  confirmar_cambio_carrera() {
    for (let carrera of this.carreras) {
      if (carrera.id == this.id_carrera) {
        this.Carrera = carrera.nombre
        break;
      }
    }
    this.service.cambiar_carrera(this.ID, this.id_carrera).subscribe({
      next: (data: any) => {

      },
      error: (error: any) => {
        console.log(error);
        return;
      },
      complete: () => {
        this.edicion2 = 0;
        window.location.reload();
      }
    })

  }

  redirecTo() {
    try {
      window.location.href = this.Link;
    } catch {
      console.log("No existe Link");
    }

  }

  checkout(arg: any) {
    this.id_carrera = Number(arg.target.value)
  }
}
