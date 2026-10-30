import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Intro } from './intro';
import { provideTranslateTesting, TEST_TRANSLATIONS } from '@App/testing/translate-testing';

describe('Intro', () => {
  let component: Intro;
  let fixture: ComponentFixture<Intro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Intro],
      providers: [provideTranslateTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Intro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should render the translated title, subtitle and description', () => {
    const native: HTMLElement = fixture.nativeElement;

    expect(component).toBeTruthy();
    expect(native.querySelector('.title')?.textContent?.trim()).toBe(TEST_TRANSLATIONS.home.title);
    expect(native.querySelector('.subtitle')?.textContent?.trim()).toBe(TEST_TRANSLATIONS.home.subtitle);
    expect(native.querySelector('.description')?.textContent?.trim()).toBe(TEST_TRANSLATIONS.home.description);
  });
});
