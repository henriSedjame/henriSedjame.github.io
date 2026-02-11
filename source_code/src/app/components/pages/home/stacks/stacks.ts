import {Component, effect, ElementRef, viewChild} from '@angular/core';
import {STACKS, TechStack} from '@App/models';
import {patchState, signalState} from '@ngrx/signals';
import {StackItem} from './stack-item/stack-item';
import {SectionTitle} from '@App/components';
import {ifDefined} from '@hsedjame/optionjs';
import {NgClass} from '@angular/common';


@Component({
  selector: 'home-stacks',
  imports: [
    StackItem,
    SectionTitle,
    NgClass
  ],
  templateUrl: './stacks.html',
  styleUrl: './stacks.scss',
})
export class Stacks {

  GRID_CATEGORY_COLUMNS_XXL = 4
  GRID_CATEGORY_COLUMNS_XL = 4
  GRID_CATEGORY_COLUMNS_LG = 3
  GRID_CATEGORY_COLUMNS_MD = 3
  GRID_CATEGORY_COLUMNS_SM = 2
  GRID_CATEGORY_COLUMNS_XS = 1
  GRID_STACKS_COLUMNS = 4
  GRID_STACKS_COLUMNS_XS = 6


  stack_grid_view = viewChild<ElementRef>('stacks_grid')

  state = signalState({
    stacks: STACKS.map((s, i) => (
      {...s, lines_number: Math.ceil(s.stacks.length / 4), index: i})
    ),
    selected_stack: undefined as TechStack | undefined
  })

  _ = effect(() => {
    ifDefined(
      this.stack_grid_view()?.nativeElement?.style,
      style=> {

        this.state.stacks()
          .forEach((stack, i) => {
            let l = Math.ceil(stack.stacks.length / this.GRID_STACKS_COLUMNS) + 1
            let lxs = Math.ceil(stack.stacks.length / this.GRID_STACKS_COLUMNS_XS) + 1
            style.setProperty(`--item-line-${i}`, l)
            style.setProperty(`--item-line-${i}-xs`, lxs)
          })

        let lines_total =  (cols: number = this.GRID_STACKS_COLUMNS) => this.state.stacks()
          .reduce((acc, stack) => acc + Math.ceil(stack.stacks.length /  cols) + 1, 0)

        style.setProperty('--stack-cols-number-xs', this.GRID_STACKS_COLUMNS_XS)
        style.setProperty('--stack-cols-number', this.GRID_STACKS_COLUMNS)

        style.setProperty('--cols-number-xxl', this.GRID_CATEGORY_COLUMNS_XXL)
        style.setProperty('--cols-number-xl', this.GRID_CATEGORY_COLUMNS_XL)
        style.setProperty('--cols-number-lg', this.GRID_CATEGORY_COLUMNS_LG)
        style.setProperty('--cols-number-md', this.GRID_CATEGORY_COLUMNS_MD)
        style.setProperty('--cols-number-sm', this.GRID_CATEGORY_COLUMNS_SM)
        style.setProperty('--cols-number-xs', this.GRID_CATEGORY_COLUMNS_XS)

        style.setProperty('--rows-number-xxl', (Math.ceil(lines_total() / this.GRID_CATEGORY_COLUMNS_XXL)) )
        style.setProperty('--rows-number-xl', (Math.ceil(lines_total() / this.GRID_CATEGORY_COLUMNS_XL)) )
        style.setProperty('--rows-number-lg', (Math.ceil(lines_total() / this.GRID_CATEGORY_COLUMNS_LG)) )
        style.setProperty('--rows-number-md', (Math.ceil(lines_total() / this.GRID_CATEGORY_COLUMNS_MD)) )
        style.setProperty('--rows-number-sm', (Math.ceil(lines_total() / this.GRID_CATEGORY_COLUMNS_SM)) )
        style.setProperty('--rows-number-xs', (Math.ceil(lines_total() / (this.GRID_CATEGORY_COLUMNS_XS))) )
      }
    )
  });

  selectStack(stack: TechStack | undefined) {
    patchState(this.state, {selected_stack: stack})
  }
}
