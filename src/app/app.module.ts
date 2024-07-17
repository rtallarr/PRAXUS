import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ArchivosService } from './servicios/archivos/archivos.service';
import { GetDetallesAlumnoService } from './servicios/encargado/resumen_practicas.service';
import { SetDetallesAlumnoService } from './servicios/encargado/decision.service';
import { SupervisorService } from './servicios/supervisor/supervisor.service';

import { EvaluacionComponent } from './vistas/evaluacion_supervisor/evaluacion_supervisor.component';
import { DetallePracticaComponent } from './vistas/detalle-practica/detalle-practica.component';
import { LoginComponent } from './vistas/login/login.component';
import { BlankComponent } from './vistas/blank/blank.component';
import { RegistroComponent } from './vistas/registro/registro.component';
import { ForgotPasswordComponent } from './vistas/forgot-password/forgot-password.component';
import { EstadisticasComponent } from './vistas/estadisticas/estadisticas.component';
import { PasswordRecoveryComponent } from './vistas/password-recovery/password-recovery.component';

import { FooterComponent } from './componentes/footer/footer.component';
import { BarraSuperiorComponent } from './componentes/barra-superior/barra-superior.component';
import { LogoutModalComponent } from './componentes/logout-modal/logout-modal.component';
import { BarraLateralAlumnoComponent } from './componentes/barra-lateral-alumno/barra-lateral-alumno.component';
import { BarraLateralEncargadoComponent } from './componentes/barra-lateral-encargado/barra-lateral-encargado.component';
import { TablaComponent } from './vistas/resumen_practicas/resumen_practicas.component';
import { ChatComponent } from './componentes/chat/chat.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { DataTablesModule } from "angular-datatables";
import { CookieService } from 'ngx-cookie-service';
import { BotonSolicitarArchivoComponent } from './componentes/boton-solicitar-archivo/boton-solicitar-archivo.component';

import { SubirArchivoExtraComponent } from './componentes/subir-archivo-extra/subir-archivo-extra.component';
import { SubirArchivoComponent } from './componentes/subir-archivo/subir-archivo.component';
import { EncuestaFinPracticaComponent } from './vistas/encuesta-fin-practica/encuesta-fin-practica.component';
import { FragmentosComponent } from './componentes/fragmentos/fragmentos.component';
import { InformeComponent } from './vistas/informe/informe.component';
import { NotisHistorialComponent } from './vistas/notis-historial/notis-historial.component';
import { ImportModalComponent } from './componentes/import-modal/import-modal.component';
import { MigrarModalComponent } from './componentes/migrar-modal/migrar-modal.component';
import { ExplicacionConsistenciaComponent } from './vistas/explicacion-consistencia/explicacion-consistencia.component';
import { VistaSupervisorComponent } from './vistas/vista-supervisor/vista-supervisor/vista-supervisor.component';
import { RamosAlumnosComponent } from './vistas/ramos-alumnos/ramos-alumnos.component';
import { RamosEncargadoComponent } from './vistas/ramos-encargado/ramos-encargado.component';
import { EstadisticaEmpresasComponent } from './vistas/estadistica-empresas/estadistica-empresas.component';
import { AdminComponent } from './vistas/admin/admin.component';
import { BarraLateralAdminComponent } from './componentes/barra-lateral-admin/barra-lateral-admin.component';
import { RegistroEncargadoComponent } from './vistas/registro-encargado/registro-encargado.component';
import { IngresoInformeComponent } from './vistas/ingreso-informe/ingreso-informe.component';
import { EstudianteVerInformeComponent } from './vistas/estudiante-ver-informe/estudiante-ver-informe.component';
import { InfoYEvaluacionEstudianteComponent } from './vistas/wizards/info-y-evaluacion-estudiante/info-y-evaluacion-estudiante.component';
import { DetalleEstudianteComponent } from './vistas/wizards/detalle-estudiante/detalle-estudiante.component';
import { EditarEncargadoModalComponent } from './componentes/editar-encargado-modal/editar-encargado-modal.component';
import { CrearEncargadoModalComponent } from './componentes/crear-encargado-modal/crear-encargado-modal.component';
import { CrearCarreraModalComponent } from './componentes/crear-carrera-modal/crear-carrera-modal.component';
import { EditarCarreraModalComponent } from './componentes/editar-carrera-modal/editar-carrera-modal.component';
import { RegistroSupervisorComponent } from './vistas/registro-supervisor/registro-supervisor.component';
import { ConfigPracticaComponent } from './vistas/wizards/config-practica/config-practica.component';
import { AptitudesComponent } from './vistas/aptitudes/aptitudes.component';
import { CrearAptitudModalComponent } from './componentes/crear-aptitud-modal/crear-aptitud-modal.component';
import { EditarAptitudModalComponent } from './componentes/editar-aptitud-modal/editar-aptitud-modal.component';
import { RangoModalComponent } from './componentes/rango-modal/rango-modal.component';
import { VistaConfigsPracticaComponent } from './vistas/vista-configs-practica/vista-configs-practica.component';
import { EdicionSimpleModalComponent } from './componentes/edicion-simple-modal/edicion-simple-modal.component';
import { PlagiosComponent } from './vistas/plagios/plagios.component';
import { ComentariosModalComponent } from './componentes/comentarios-modal/comentarios-modal.component';
import { DocumentacionComponent } from './vistas/documentacion/documentacion.component';
import { SubirDocumentoEncargadoComponent } from './componentes/subir-documento-encargado/subir-documento-encargado.component';
import { SubirPlantillaInformeFinalComponent } from './componentes/subir-plantilla-informe-final/subir-plantilla-informe-final.component';
import { ConfirmarInicioPracticaComponent } from './vistas/confirmar-inicio-practica/confirmar-inicio-practica.component';
import { ConfirmacionUsuarioComponent } from './vistas/confirmacion-usuario/confirmacion-usuario.component';
import { SubirArchivoInformeFinalComponent } from './componentes/subir-archivo-informe-final/subir-archivo-informe-final.component';
import { EditarArchivoEncargadoComponent } from './componentes/editar-archivo-encargado/editar-archivo-encargado.component';
import { AgregarDominioModalComponent } from "./componentes/agregar-dominio-modal/agregar-dominio-modal.component";
import { authInterceptor } from "./interceptores/auth/auth.interceptor";

@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    EvaluacionComponent,
    DetallePracticaComponent,
    FooterComponent,
    BarraSuperiorComponent,
    LogoutModalComponent,
    LoginComponent,
    BarraLateralAlumnoComponent,
    BlankComponent,
    RegistroComponent,
    ForgotPasswordComponent,
    BarraLateralEncargadoComponent,
    EstadisticasComponent,
    BotonSolicitarArchivoComponent,
    TablaComponent,
    ChatComponent,
    SubirArchivoExtraComponent,
    SubirArchivoComponent,
    EncuestaFinPracticaComponent,
    FragmentosComponent,
    InformeComponent,
    NotisHistorialComponent,
    ImportModalComponent,
    MigrarModalComponent,
    ExplicacionConsistenciaComponent,
    VistaSupervisorComponent,
    RamosAlumnosComponent,
    RamosEncargadoComponent,
    EstadisticaEmpresasComponent,
    AdminComponent,
    BarraLateralAdminComponent,
    RegistroEncargadoComponent,
    IngresoInformeComponent,
    EstudianteVerInformeComponent,
    InfoYEvaluacionEstudianteComponent,
    DetalleEstudianteComponent,
    EditarEncargadoModalComponent,
    CrearEncargadoModalComponent,
    CrearCarreraModalComponent,
    EditarCarreraModalComponent,
    RegistroSupervisorComponent,
    ConfigPracticaComponent,
    AptitudesComponent,
    CrearAptitudModalComponent,
    EditarAptitudModalComponent,
    RangoModalComponent,
    VistaConfigsPracticaComponent,
    EdicionSimpleModalComponent,
    PlagiosComponent,
    ComentariosModalComponent,
    DocumentacionComponent,
    SubirDocumentoEncargadoComponent,
    SubirPlantillaInformeFinalComponent,
    ConfirmarInicioPracticaComponent,
    ConfirmacionUsuarioComponent,
    SubirArchivoInformeFinalComponent,
    EditarArchivoEncargadoComponent,
    AgregarDominioModalComponent,
    PasswordRecoveryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DataTablesModule,
    MatButtonModule,
    NoopAnimationsModule,
    MatSnackBarModule,
    HttpClientModule,
    NgbModule,
    MatInputModule,
    MatCardModule,
    MatListModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatToolbarModule,
    TextFieldModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatRadioModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatTabsModule
  ],
  providers: [
    GetDetallesAlumnoService,
    SetDetallesAlumnoService,
    ArchivosService,
    SupervisorService,
    DatePipe,
    GetDetallesAlumnoService,
    SetDetallesAlumnoService,
    ArchivosService,
    SupervisorService,
    CookieService,
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }],
  bootstrap: [AppComponent]
})


export class AppModule { }
