import { Component } from '@angular/core';

import { environment } from '../../../environments/environment';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { ObtenerDatosService } from '../../servicios/alumno/obtener_datos.service';
import { CarreraService } from '../../servicios/carrera/carrera.service';

@Component({
  selector: 'app-ramos-alumnos',
  templateUrl: './ramos-alumnos.component.html',
  styleUrls: ['./ramos-alumnos.component.scss']
})
export class RamosAlumnosComponent {

  constructor(private _http: HttpClient, private _router: Router, private _obtenerDatosService: ObtenerDatosService, private carreraService: CarreraService) { }

  sesion: any = JSON.parse(localStorage.getItem("auth-user") || "{}")

  arreglo_ramos: any[] = [];

  //arreglo_ramos = ["programacion",50,"talf",50,"lenguajes de programacion",100,"bases de datos",60,"redes",50,"ing SW",25,"SO",7.5,"IA",30,"IO",5,"IMAFI",10,"Computacion cientifica",10,"Sitemas distribuidos",40]

  //arreglo_ramos = ["programacion",50,"talf",50,"lenguajes de programacion",100,"bases de datos",60,"redes",50,"ing SW",25,"SO",7.5]

  //filtrar lista a 10 ramos mas importantes

  ramos: string[] = [];
  porcentajes: number[] = [];

  ramos_top10: string[] = [];
  porcentajes_top10: number[] = [];

  arreglo_ramos_top10: any[] = [];

  ngOnInit(): void {

    //console.log(this.sesion);
    //console.log(this.sesion.userdata.id);

    let id_usuario = this.sesion.userdata.id;

    //obte
    let respuesta: any = {};

    this._obtenerDatosService.obtener_estudiante(this.sesion.userdata.id).subscribe({
      next: data => {
        //console.log(data);
        respuesta = { ...respuesta, ...data }
      },
      error: error => {
        console.log(error);
      },
      complete: () => {
        //console.log("respuesta id_carrera:");
        //console.log(respuesta.body.id_carrera);

        this.carreraService.obtener_carrera(respuesta.body.id_carrera).subscribe({
          next: data => {
            //console.log(data);
            respuesta = { ...respuesta, ...data }
          },
          error: error => {
            console.log(error);
          },
          complete: () => {

            //console.log("estadistica ramos carrera:");
            //console.log(respuesta.body.estadistica_ramos.array);

            //let arreglo_ramos_aux = respuesta.body.estadistica_ramos.array;
            //console.log("arreglo ramos aux:");
            //console.log(arreglo_ramos_aux[0]);
            console.log(respuesta.body)
            console.log("Estadística Ramos: " + respuesta.body.estadistica_ramos)
            this.arreglo_ramos = respuesta.body.estadistica_ramos.array[0];

            for (let i = 0; i < this.arreglo_ramos.length; i++) {
              if (this.isNumber(this.arreglo_ramos[i])) {
                this.porcentajes.push(Number(this.arreglo_ramos[i]));
              }
              else{
                this.ramos.push(String(this.arreglo_ramos[i]));
              }
            }
        
            //console.log("Ramos: ");
            //console.log(this.ramos);
            //console.log("Porcentajes: ");
            //console.log(this.porcentajes);
        
            
            for (let i = 0; i < this.ramos.length; i++) {
              this.ramos_top10.push(this.ramos[i]);
              this.porcentajes_top10.push(this.porcentajes[i]);
            }
        
            //ordenar porcentaje de mayor a menor
            for (let i = 0; i < this.porcentajes_top10.length; i++) {
              for (let k = 0; k < this.porcentajes_top10.length; k++) {
                if (this.porcentajes_top10[i] > this.porcentajes_top10[k]) {
                  let aux = this.porcentajes_top10[i];
                  this.porcentajes_top10[i] = this.porcentajes_top10[k];
                  this.porcentajes_top10[k] = aux;
        
                  let aux2 = this.ramos_top10[i];
                  this.ramos_top10[i] = this.ramos_top10[k];
                  this.ramos_top10[k] = aux2;
                }
              }
            }
        
            //console.log("Ramos top 10 ordenados: ");
            //console.log(this.ramos_top10);
            //console.log("Porcentajes top 10 ordenados: ");
            //console.log(this.porcentajes_top10);
        
            for (let i = 0; i < 10; i++) {
              if (this.ramos_top10[i] != undefined) {
                //this.ramos_top10[i] = " ";
                this.arreglo_ramos_top10.push(this.ramos_top10[i]);
                this.arreglo_ramos_top10.push(this.porcentajes_top10[i]);
              }
            }
        
            console.log("Arreglo top 10: ");
            console.log(this.arreglo_ramos_top10);
        
            this.arreglo_ramos = this.arreglo_ramos_top10;

          }
        });
      }
    });

    
    
  }

  


  isNumber(val: any){ return typeof val === 'number'; }

  largo_arreglo(arg: any) {
    return arg.length;
  }

  toInt(arg: any) {
    return parseInt(arg);
  }
}
