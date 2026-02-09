import {Component, computed} from '@angular/core';
import {STACKS, TechStack} from '@App/models';
import {patchState, signalState} from '@ngrx/signals';
import {StackItem} from './stack-item/stack-item';
import {SectionTitle} from '@App/components';


@Component({
  selector: 'home-stacks',
  imports: [
    StackItem,
    SectionTitle
  ],
  templateUrl: './stacks.html',
  styleUrl: './stacks.scss',
})
export class Stacks {

  state = signalState({
    stacks: STACKS,
    selected_stack: undefined as TechStack | undefined
  })

  max_tech_lines = computed(() => {
    let max = this.state().stacks.reduce((max, stack) => {
      return Math.max(max, stack.stacks.length)
    }, 0)
    return Math.ceil(max / 4)
  });


  selectStack(stack: TechStack | undefined) {
    patchState(this.state, {selected_stack: stack})
  }

  protected readonly Math = Math;
}
