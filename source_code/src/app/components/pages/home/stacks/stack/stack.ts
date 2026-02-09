import {Component, computed, input} from '@angular/core';
import {NgOptimizedImage, NgTemplateOutlet} from '@angular/common';
import {TechStack} from '@App/models';

@Component({
  selector: 'tech-stack',
  imports: [
    NgTemplateOutlet,
    NgOptimizedImage
  ],
  templateUrl: './stack.html',
  styleUrl: './stack.scss',
})
export class Stack {

  tech_stack = input.required<TechStack>();

  min_height = computed(() => {
    let length = this.tech_stack().linked_stacks.length;
    let h = length === 0 ? 50 : length * 50
    return `min-h-${h}`
  });

}
