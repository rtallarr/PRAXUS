import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarDominioModalComponent } from './agregar-dominio-modal.component';

describe('AgregarDominioModalComponent', () => {
  let component: AgregarDominioModalComponent;
  let fixture: ComponentFixture<AgregarDominioModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarDominioModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgregarDominioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
