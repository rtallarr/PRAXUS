import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DominiosAceptadosService } from 'src/app/servicios/dominios_aceptados/dominios-aceptados.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-agregar-dominio-modal',
  templateUrl: './agregar-dominio-modal.component.html',
  styleUrl: './agregar-dominio-modal.component.scss'
})
export class AgregarDominioModalComponent implements OnInit {
  dominiosForm: FormGroup;

  constructor(
    private fb: FormBuilder, private dominios_service: DominiosAceptadosService,
    private _snackBar: MatSnackBar
  ) { this.createForm() }

  ngOnInit(): void {

  }

  createForm() {
    this.dominiosForm = this.fb.group({
      dominios: ['', [Validators.required]]
    });
  }

  crear() {
    const data = this.dominiosForm.value;
    let dominios = data.dominios;
    let lista = this.listar(dominios);
    let _data: any = {}
    this.dominios_service.put_multi(lista).subscribe({
      next: data => {
        _data = { ..._data, ...data }
      },
      complete: () => {
        if (_data.status == 200) {
          this._snackBar.open("Dominio(s) creado(s) exitosamente", "Cerrar", {
            panelClass: ['green-snackbar'],
            duration: 2000
          });
          setTimeout(function () {
            window.location.reload();
          }, 2000);
        } else {
          this._snackBar.open("Error al agregar dominios", "Cerrar", {
            panelClass: ['red-snackbar'],
            duration: 2000
          });
        }
      },
      error: error => {
        this._snackBar.open("Error al agregar dominios", "Cerrar", {
          panelClass: ['red-snackbar'],
          duration: 2000
        });
      }
    });

  }

  listar(nombre: string): string[] {
    let lista: string[] = nombre.split('\n');
    for (let i = 0; i < lista.length; i++) {
      lista[i] = lista[i].trim();
    }
    return lista;
  }
}
