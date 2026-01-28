import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Items } from './items';
import {provideTranslateService} from '@ngx-translate/core';

describe('Items', () => {
  let component: Items;
  let fixture: ComponentFixture<Items>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Items],
      providers: [
        provideTranslateService()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Items);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
