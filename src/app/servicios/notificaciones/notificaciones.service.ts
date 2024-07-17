import { HttpClient, HttpRequest } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class NotificacionesService extends Socket {

  private connectionReadySubject: Subject<void> = new Subject<void>();
  connectionReady$ = this.connectionReadySubject.asObservable();

  private eventSubject: Subject<any> = new Subject<any>();
  event$ = this.eventSubject.asObservable();

  @Output() outEven: EventEmitter<any> = new EventEmitter();
  @Output() callback: EventEmitter<any> = new EventEmitter();

  constructor(private _http: HttpClient, private datetime: DatePipe) {
    super({
      url: environment.url_back_chat,
      options: {
        query: {
          nameRoom: "notificaciones" + JSON.parse(localStorage.getItem("auth-user") || "{}").userdata?.id
        },
      }
    });
    this.listen();
  }

  listen = () => {
    this.ioSocket.on('notificacion', (res: any) => {
      console.log("notificacion recibida, el mensaje es", res.message);
      this.callback.emit(res);
    });
  }

  postnotificacion(id_usuario: number, mensaje: any, correo: string, estado: string, enlace: string = "") {
    let fecha = this.datetime.transform((new Date), 'MM/dd/yyyy h:mm:ss')

    const req = new HttpRequest('POST', `${environment.url_back}/notificacion/crear`, { id_usuario, fecha, mensaje, correo, estado, enlace }, { responseType: 'text' });
    return this._http.request(req);
  }


  notificaciones_vistas(id_usuario: number) {
    const req = new HttpRequest('PUT', `${environment.url_back}/notificacion/visto`, { id_usuario }, { responseType: "text" });
    return this._http.request(req);
  }

  cambiar_configuración_notificaciones(id: number, estado: string) {
    const req = new HttpRequest('PUT', `${environment.url_back}/usuario/estado_config`, { id, estado }, { responseType: "text" });
    return this._http.request(req);
  }

}
