import { Component } from '@angular/core';
import { UsuarioService } from '../../servicios/usuario/usuario.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-confirmacion-usuario',
  templateUrl: './confirmacion-usuario.component.html',
  styleUrls: ['./confirmacion-usuario.component.scss']
})
export class ConfirmacionUsuarioComponent {

  correo_confirmado: boolean = false;
  usuario: any = {};

  constructor(activated_route: ActivatedRoute, private usuario_service: UsuarioService) {
    let token = "";
    let iv = "";
    let response: any = {};

    //obtener token y iv de la url
    activated_route.queryParams.subscribe(params => {
      token = params['token'];
      iv = params['iv'];
    });

    //obtener usuario
    this.usuario_service.get_usuario_encriptado(token, iv).subscribe({
      next: (data: any) => {
        response = { ...response, ...data };
      },
      error: (error: any) => {
        console.log(error);
      },
      complete: () => {
        if (response) {
          this.correo_confirmado = true;
          this.usuario = response.body.userdata;
          console.log(this.usuario);
        }
      }
    });

  }



}
