import { Component } from '@angular/core';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { StorageUserService } from 'src/app/servicios/usuario/storage-user.service';
import { DominiosAceptadosService } from 'src/app/servicios/dominios_aceptados/dominios-aceptados.service';
import { Router } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  email: string;
  password: string;
  dominio_select: string;
  dataUsuario: any;
  lista_dominios: string[] = [];

  constructor(
    public usuario: UsuarioService, private storage: StorageUserService,
    public dominios_service: DominiosAceptadosService, private router: Router,
    private fb: FormBuilder, private _snackBar: MatSnackBar
  ) {
    let respuesta_dominios: any = {};
    dominios_service.get_all().subscribe({
      next: (data: any) => {
        respuesta_dominios = { ...respuesta_dominios, ...data }
      },
      error: (err: any) => { },
      complete: () => {
        respuesta_dominios.body.forEach((obj: any) => {
          this.lista_dominios.push(obj.dominio);
        });
      }
    });
    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      dominio_select: ['', Validators.required]
    });
  }

  login() {
    let response: any = {};
    const data = this.loginForm.value;
    console.log(data);
    this.usuario.login(data.email, data.password, data.dominio_select).subscribe({
      next: data => {
        response = { ...response, ...data }
      },
      error: err => {
        this._snackBar.open(err.error.message, "OK", {
          duration: 5000,
        });
      },
      complete: () => {
        if (response.status == 200) {
          this.dataUsuario = response.body.userdata
          this.storage.saveUser(response.body) //¿response.body.userdata?
          if (this.dataUsuario.es_encargado) {
            this.router.navigate(["/" + environment.ruta_practicas])
          } else if (this.dataUsuario.es_estudiante) {
            this.router.navigate(["/" + environment.ruta_alumno + "/" + this.dataUsuario.id])
          } else if (this.dataUsuario.es_supervisor) {
            this.router.navigate(["/home_supervisor"])
          } else if (this.dataUsuario.es_admin) {
            this.router.navigate(["/admin"])
          }
        } else {
          this._snackBar.open(response.body.message, "OK", {
            duration: 5000,
          });
          return;
        }

      }
    });
  }
}
