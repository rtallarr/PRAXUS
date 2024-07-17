import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { AdminService } from 'src/app/servicios/admin/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-carrera-modal',
  templateUrl: './crear-carrera-modal.component.html',
  styleUrls: ['./crear-carrera-modal.component.scss']
})
export class CrearCarreraModalComponent implements OnInit {

  carreraForm: FormGroup;
  nombre: string;

  createForm() {
    this.carreraForm = this.fb.group({
      nombre: ['', [Validators.required]]
    });
  }

  constructor(public admin: AdminService, private fb: FormBuilder, private _snackBar: MatSnackBar, private router: Router) { this.createForm(); }

  ngOnInit(): void {
  }

  crear() {
    const data = this.carreraForm.value;
    this.nombre = data.nombre;
    let lista = this.listar(this.nombre);
    let _data: any = {}
    this.admin.crearCarrera(lista).subscribe({
      next: data => {
        _data = { ..._data, ...data }
      },
      complete: () => {
        if (_data.status == 200) {
          this._snackBar.open("Carrera(s) creada(s) exitosamente", "Cerrar", {
            panelClass: ['green-snackbar'],
            duration: 2000
          });
          setTimeout(function () {
            window.location.reload();
          }, 2000);
        } else {
          this._snackBar.open("Error al crear carrera", "Cerrar", {
            panelClass: ['red-snackbar'],
            duration: 2000
          });
        }
      },
      error: error => {
        this._snackBar.open("Error al crear carrera", "Cerrar", {
          panelClass: ['red-snackbar'],
          duration: 2000
        });
      }
    });

  }

  listar(nombre: string) {
    let lista = nombre.split('\n');
    for (let i = 0; i < lista.length; i++) {
      lista[i] = lista[i].trim();
    }
    return lista;
  }
}
