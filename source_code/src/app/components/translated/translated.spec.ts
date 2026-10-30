import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Translated } from './translated';
import { provideTranslateTesting, TEST_TRANSLATIONS } from '@App/testing/translate-testing';

describe('Translated', () => {
  let component: Translated;
  let fixture: ComponentFixture<Translated>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Translated],
      providers: [provideTranslateTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Translated);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('value', 'home.title');
    await fixture.whenStable();
  });

  it('should render the translation of the value key', () => {
    const span: HTMLElement = fixture.nativeElement.querySelector('span');

    expect(span.textContent?.trim()).toBe(TEST_TRANSLATIONS.home.title);
    expect(span.textContent?.trim()).not.toBe('home.title');
  });

  it('should follow the value input when it changes', async () => {
    const span: HTMLElement = fixture.nativeElement.querySelector('span');

    fixture.componentRef.setInput('value', 'close');
    await fixture.whenStable();

    expect(span.textContent?.trim()).toBe(TEST_TRANSLATIONS.close);
    expect(component.value()).toBe('close');
  });
});
