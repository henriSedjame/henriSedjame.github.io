import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackItem } from './stack-item';
import { TechStack } from '@App/models';
import { provideTranslateTesting, TEST_TRANSLATIONS } from '@App/testing/translate-testing';

const java: TechStack = {
  name: 'java',
  label: 'Java',
  type: 'Language',
  logo: 'tech-icons/java.svg',
  linked_stacks: []
};

const angular: TechStack = {
  name: 'angular',
  label: 'Angular',
  type: 'Framework',
  logo: 'tech-icons/angular.svg',
  linked_stacks: []
};

describe('StackItem', () => {
  let fixture: ComponentFixture<StackItem>;
  let native: HTMLElement;

  const render = async (stack: TechStack, active: boolean) => {
    fixture = TestBed.createComponent(StackItem);
    fixture.componentRef.setInput('stack', stack);
    fixture.componentRef.setInput('active', active);
    await fixture.whenStable();
    native = fixture.nativeElement;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StackItem],
      providers: [provideTranslateTesting()]
    })
    .compileComponents();
  });

  it('should render the icon and the tooltip label of the received stack', async () => {
    await render(java, false);

    const image = native.querySelector('img');

    expect(native.querySelector('.tooltip')?.textContent?.trim()).toBe(java.label);
    expect(image?.getAttribute('src')).toBe(java.logo);
    expect(image?.getAttribute('alt')).toBe('java icon');
    expect(fixture.componentInstance.icon_class()).toContain('language');
    expect(native.querySelector('.voile')).toBeNull();
  });

  it('should emit the stack through selectStack when the icon is clicked', async () => {
    await render(angular, false);

    const emitted: (TechStack | undefined)[] = [];
    fixture.componentInstance.selectStack.subscribe(stack => emitted.push(stack));

    native.querySelector<HTMLElement>('.stack__icon')!.click();

    expect(emitted).toEqual([angular]);
    expect(fixture.componentInstance.icon_class()).not.toContain('language');
  });

  it('should reveal the detail panel with the translated close button when active', async () => {
    await render(java, true);

    expect(native.querySelector('.voile')).toBeTruthy();
    expect(native.querySelector('.stack__detail')).toBeTruthy();
    expect(native.querySelector('.close__btn')?.textContent?.trim()).toBe(TEST_TRANSLATIONS.close);
    expect(fixture.componentInstance.icon_class()).toContain('active');
  });
});
