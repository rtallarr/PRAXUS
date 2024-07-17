import { Component } from '@angular/core';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrl: './password-recovery.component.scss'
})

export class PasswordRecoveryComponent {
  loginForm: FormGroup;
  password1: string;
  password2: string;
  id: number
  token: string

  constructor(
    public usuario: UsuarioService, 
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      password1: ['', Validators.required],
      password2: ['', Validators.required]
    });
  }

  ngOnInit(){
    const urls = this.route.snapshot.url
    this.route.params.subscribe(params => {this.id = +params['n'];});
    this.route.params.subscribe(params => {this.token = params['token'];});
  }

  send() {
    let response: any = {};
    const data = this.loginForm.value;
    console.log(data);
    console.log(this.id);
    this.password1 = data.password1
    this.password2 = data.password2

    if ((this.password1 === this.password2) == false)  {
      this._snackBar.open("Las contraseñas no coindiden", "OK", {
        duration: 5000,
      });
    }
    else{
      this.usuario.change_password(this.id, this.password1, this.token).subscribe({
        next: data =>{
          response = { ...response, ...data }
          console.log(data)
        },
        error: err => {
          this._snackBar.open(err.error.message, "Aceptar", {
            duration: 5000,
          });
        },
        complete: () => {
          this._snackBar.open("Contraseña cambiada con éxito", "Aceptar", {
            duration: 5000,
          });
          this.router.navigate(["/login"])
        }
      })
    }
  }
}
