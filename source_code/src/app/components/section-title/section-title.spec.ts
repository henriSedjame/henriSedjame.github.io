import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionTitle } from './section-title';
import { provideTranslateTesting, TEST_TRANSLATIONS } from '@App/testing/translate-testing';

describe('SectionTitle', () => {
  let component: SectionTitle;
  let fixture: ComponentFixture<SectionTitle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionTitle],
      providers: [provideTranslateTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionTitle);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title_key', 'home.technical_skills');
    await fixture.whenStable();
  });

  it('should render the translated title between the two lines', () => {
    const native: HTMLElement = fixture.nativeElement;
    const title = native.querySelector('.section__title');

    expect(component.title_key()).toBe('home.technical_skills');
    expect(title?.textContent?.trim()).toBe(TEST_TRANSLATIONS.home.technical_skills);
    expect(native.querySelector('.line__top')).toBeTruthy();
    expect(native.querySelector('.line__bottom')).toBeTruthy();
  });
});
