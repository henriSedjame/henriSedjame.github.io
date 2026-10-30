import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Stacks } from './stacks';
import { STACKS } from '@App/models';
import { provideTranslateTesting } from '@App/testing/translate-testing';

describe('Stacks', () => {
  let component: Stacks;
  let fixture: ComponentFixture<Stacks>;
  let native: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stacks],
      providers: [provideTranslateTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Stacks);
    component = fixture.componentInstance;
    await fixture.whenStable();
    native = fixture.nativeElement;
  });

  it('should render one labelled category per entry of STACKS, in order', () => {
    const labels = Array.from(native.querySelectorAll<HTMLElement>('.stacks__category__label'));

    expect(component).toBeTruthy();
    expect(labels.length).toBe(STACKS.length);
    expect(labels.map(label => label.textContent?.trim())).toEqual(STACKS.map(stack => stack.category));
  });

  it('should render a grid per category and an item for every stack', () => {
    const grids = native.querySelectorAll('.stack__items__grid');
    const items = native.querySelectorAll('tech-stack-item');
    const expected_items = STACKS.reduce((total, stack) => total + stack.stacks.length, 0);

    expect(grids.length).toBe(STACKS.length);
    expect(items.length).toBe(expected_items);
  });

  it('should track the hovered stacks of a category and clear them on leave', () => {
    const grid = native.querySelector<HTMLElement>('.stack__items__grid')!;

    grid.dispatchEvent(new MouseEvent('mouseenter'));
    expect(component.hovered_tech()).toEqual(STACKS[0].stacks.map(stack => stack.name));

    grid.dispatchEvent(new MouseEvent('mouseleave'));
    expect(component.hovered_tech()).toEqual([]);
  });
});
