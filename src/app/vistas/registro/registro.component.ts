import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { CarreraService } from '../../servicios/carrera/carrera.service';
import { DominiosAceptadosService } from '../../servicios/dominios_aceptados/dominios-aceptados.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from "@angular/router";
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit {
  registroForm: FormGroup;
  nombre: string = "";
  apellido: string = "";
  email: string = "";
  password: string = "";
  confirmPassword: string = "";
  es_supervisor: boolean = false;
  es_estudiante: boolean = true;
  es_encargado: boolean = false;
  RUT: string = "";
  id_carrera: number;
  extras = {};
  checkEs = true;

  carreras: any = [];
  dominios: any = [];

  constructor(
    public usuario: UsuarioService, public carrera_service: CarreraService,
    public dominios_service: DominiosAceptadosService, private fb: FormBuilder,
    private _snackBar: MatSnackBar, private router: Router
  ) {
    let respuesta: any = {}
    carrera_service.obtener_carreras().subscribe({
      next: (data: any) => {
        respuesta = { ...respuesta, data }
      },
      error: (error: any) => {
        return;
      },
      complete: () => {
        for (var val of respuesta.data.body) {
          this.carreras.push(val);
        }
      }
    });
    let respuesta_dominios: any = {};
    dominios_service.get_all().subscribe({
      next: (data: any) => {
        respuesta_dominios = { ...respuesta, ...data };
      },
      error: (err: any) => { },
      complete: () => {
        respuesta_dominios.body.forEach((obj: any) => {
          this.dominios.push(obj.dominio);
        });
      }

    })
    this.createForm();
  }

  // funcion de comprobacion de correo

  comprobar_dominio(val: any) {
    let dominio = val.correos_admitidos;
    if (this.dominios.indexOf(dominio) == -1 && dominio != null && dominio != "") {
      this.dominios.push(dominio);
    }
    return;
  }

  createForm() {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellido: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', Validators.required],
      dom: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(3)]],
      confirmPassword: ['', Validators.required],
      RUT: ['', Validators.required],
      id_carrera: ['', Validators.required]
    });
  }

  ngOnInit(): void {

  }

  register() {
    const data = this.registroForm.value;
    this.RUT = data.RUT
    //this.email = data.email
    this.email = data.email + "@" + data.dom;
    this.nombre = data.nombre + " " + data.apellido;
    this.id_carrera = data.id_carrera;
    if (this.es_estudiante) {
      this.extras = { RUT: this.RUT, id_carrera: this.id_carrera };
    }
    if (this.es_supervisor) {
      this.extras = {};
    }
    if (this.es_encargado) {
      this.extras = {};
    }
    let _data: any = {}
    this.usuario.register(
      this.email, data.password,
      data.confirmPassword, this.nombre,
      false, false,
      true, false,
      this.extras
    ).subscribe({
      next: data => {
        _data = { ..._data, ...data }
      },
      complete: () => {
        if (_data.status == 200) {
          this.router.navigate(["/" + environment.ruta_login])
          this._snackBar.open("Se ha enviado correo de confirmación para crear al usuario.", "Cerrar", {
            panelClass: ['green-snackbar'],
            duration: 2000
          });
        } else {
          this._snackBar.open(_data.body.message, "Cerrar", {
            panelClass: ['red-snackbar'],
            duration: 2000
          });
        }
      },
      error: err => {
        this._snackBar.open(err.error.message, "Cerrar", {
          panelClass: ['red-snackbar'],
          duration: 2000
        });
      }
    });
  }
}
