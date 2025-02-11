import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { AptitudService } from 'src/app/servicios/encargado/aptitud.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-aptitud-modal',
  templateUrl: './crear-aptitud-modal.component.html',
  styleUrls: ['./crear-aptitud-modal.component.scss']
})
export class CrearAptitudModalComponent implements OnInit{

  aptitudForm: FormGroup;
  nombre: string;
  user: any = JSON.parse(localStorage.getItem('auth-user') || "{}").userdata;

  createForm(){
    this.aptitudForm = this.fb.group({
      nombre: ['', Validators.required],
    });
  }

  constructor(private aptitud: AptitudService, private _snackBar: MatSnackBar, private fb: FormBuilder, private router: Router) { 
    this.createForm();
  }

  ngOnInit(): void {
      
  }

  crear(){
    let data = this.aptitudForm.value;
    let _data: any = {};
    let lista = this.listar(data.nombre);
    this.aptitud.crearAptitud(this.user.encargado.id_carrera, lista).subscribe({
      next: data => {
        _data = { ..._data, ...data }
      },
      error: error => {
        this._snackBar.open("Error al crear aptitud", "Cerrar", {
          panelClass: ['red-snackbar'],
          duration: 2000
        });
      },
      complete: () => {
        if (_data.status == 200) {
          this._snackBar.open("Aptitud creada exitosamente", "Cerrar", {
            panelClass: ['green-snackbar'],
            duration: 2000
          });
          setTimeout(function () {
            window.location.reload();
          }, 2000);
        } else {
          this._snackBar.open("Error al crear aptitud", "Cerrar", {
            panelClass: ['red-snackbar'],
            duration: 2000
          });
        }
      }
    });
  }

  listar(nombre: string){
    let lista = nombre.split('\n');
    for(let i = 0; i < lista.length; i++){
      lista[i]=lista[i].trim();
    }
    return lista;
  }
}
