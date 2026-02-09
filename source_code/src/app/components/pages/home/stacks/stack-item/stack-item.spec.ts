import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackItem } from './stack-item';

describe('StackItem', () => {
  let component: StackItem;
  let fixture: ComponentFixture<StackItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StackItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StackItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
