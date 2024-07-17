import { TestBed } from '@angular/core/testing';

import { DominiosAceptadosService } from './dominios-aceptados.service';

describe('DominiosAceptadosService', () => {
  let service: DominiosAceptadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DominiosAceptadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
