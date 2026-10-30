import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Stack } from './stack';
import { TechStack } from '@App/models';

const spring: TechStack = {
  name: 'spring',
  label: 'Spring',
  type: 'Framework',
  logo: 'tech-icons/spring.svg',
  linked_stacks: []
};

const quarkus: TechStack = {
  name: 'quarkus',
  label: 'Quarkus',
  type: 'Framework',
  logo: 'tech-icons/quarkus.svg',
  linked_stacks: []
};

const java: TechStack = {
  name: 'java',
  label: 'Java',
  type: 'Language',
  logo: 'tech-icons/java.svg',
  linked_stacks: [spring, quarkus]
};

describe('Stack', () => {
  let fixture: ComponentFixture<Stack>;
  let native: HTMLElement;

  const render = async (tech_stack: TechStack) => {
    fixture = TestBed.createComponent(Stack);
    fixture.componentRef.setInput('tech_stack', tech_stack);
    await fixture.whenStable();
    native = fixture.nativeElement;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stack]
    })
    .compileComponents();
  });

  it('should render the logo of the received stack and one orbit per linked stack', async () => {
    await render(java);

    const images = Array.from(native.querySelectorAll('img'));

    expect(fixture.componentInstance.tech_stack()).toBe(java);
    expect(images.length).toBe(3);
    expect(images.map(image => image.getAttribute('src'))).toEqual([
      'tech-icons/java.svg',
      'tech-icons/spring.svg',
      'tech-icons/quarkus.svg'
    ]);
    expect(native.querySelectorAll('.rotation-circle').length).toBe(2);
    expect(fixture.componentInstance.min_height()).toBe('min-h-100');
  });

  it('should reserve a single tile when the stack has no linked stacks', async () => {
    await render({...java, linked_stacks: []});

    expect(native.querySelectorAll('.rotation-circle').length).toBe(0);
    expect(native.querySelectorAll('img').length).toBe(1);
    expect(fixture.componentInstance.min_height()).toBe('min-h-50');
  });
});
