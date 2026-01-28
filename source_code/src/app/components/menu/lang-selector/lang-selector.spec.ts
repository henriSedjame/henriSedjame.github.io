import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangSelector } from './lang-selector';
import {provideTranslateService} from '@ngx-translate/core';

describe('LangSelector', () => {
  let component: LangSelector;
  let fixture: ComponentFixture<LangSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LangSelector],
      providers: [
        provideTranslateService()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LangSelector);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
