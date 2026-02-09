import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Stacks } from './stacks';

describe('Stacks', () => {
  let component: Stacks;
  let fixture: ComponentFixture<Stacks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stacks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Stacks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
