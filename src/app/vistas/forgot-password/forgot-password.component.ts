import { Component } from '@angular/core';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { Router } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  loginForm: FormGroup;
  mail: string;

  constructor(
    public usuario: UsuarioService, 
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private router: Router
  ) {
    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
    });
  }

  send() {
    let response: any = {};
    const data = this.loginForm.value;
    this.mail = data.email
    this.usuario.send_mail(this.mail).subscribe({
      next: data =>{
        response = { ...response, ...data }
      },
      error: err => {
        this._snackBar.open(err.error.message, "Aceptar", {
          duration: 5000,
        });
      },
      complete: () => {
        this._snackBar.open("Correo enviado con éxito", "Aceptar", {
          duration: 5000,
        });
        this.router.navigate(["/login"])
      }
    })
  }
}
