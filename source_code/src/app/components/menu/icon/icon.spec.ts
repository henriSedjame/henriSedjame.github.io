import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Icon } from './icon';
import {provideTranslateService} from '@ngx-translate/core';

describe('Icon', () => {
  let component: Icon;
  let fixture: ComponentFixture<Icon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Icon],
      providers: [
        provideTranslateService()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Icon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
