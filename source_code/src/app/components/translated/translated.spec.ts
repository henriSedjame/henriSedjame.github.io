import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Translated } from './translated';

describe('Translated', () => {
  let component: Translated;
  let fixture: ComponentFixture<Translated>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Translated]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Translated);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
