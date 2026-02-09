import {Component, effect, ElementRef, inject, input, output, Renderer2, viewChild} from '@angular/core';
import {TechStack} from '@App/models';
import {NgClass, NgOptimizedImage} from '@angular/common';
import {Translated} from '@App/components';

@Component({
  selector: 'tech-stack-item',
  imports: [
    NgOptimizedImage,
    NgClass,
    Translated
  ],
  templateUrl: './stack-item.html',
  styleUrl: './stack-item.scss',
})
export class StackItem {


  stack = input.required<TechStack>();

  active = input.required()

  selectStack = output<TechStack | undefined>()

  stack_icon = viewChild<ElementRef<HTMLDivElement>>('stack_icon')

  stack_detail = viewChild<ElementRef>('stack_detail')

  renderer = inject(Renderer2)

  _ = effect(() => {
    let stackIcon = this.stack_icon()?.nativeElement;
    let stackDetail = this.stack_detail()?.nativeElement;

    if (stackIcon && stackDetail) {

      let rect = stackIcon?.getBoundingClientRect()
      let viewportWidth = window.visualViewport?.width || window.screen.width

      let pd = viewportWidth > 1024 ? viewportWidth * 0.1 : 0

      let top = ((rect?.y || 0)) + 'px';
      let left = ((rect?.left || 0) - pd ) + 'px';

      let width = `${stackIcon?.offsetWidth}px`;
      let height = `${stackIcon?.offsetHeight}px`;

      stackDetail.style.setProperty('--position-top', top)
      stackDetail.style.setProperty('--position-left', left)
      stackDetail.style.setProperty('--width', width)
      stackDetail.style.setProperty('--height', height)

      if (this.active()) {

        this.renderer.addClass(stackDetail, 'absolute')
        this.renderer.addClass(stackDetail, 'glass')
        this.renderer.addClass(stackDetail, 'bordered')
        this.renderer.addClass(stackDetail, 'rounded')

        this.renderer.addClass(stackDetail, 'z-2')
        this.renderer.addClass(stackDetail, 'opened')
      }
    }
  })

  open() {
    this.selectStack.emit(this.stack())
  }

  close(e: MouseEvent) {
    e.stopPropagation()

    let stackDetail = this.stack_detail()?.nativeElement;

    if (stackDetail) {
      this.renderer.removeClass(stackDetail, 'opened')

      this.renderer.addClass(stackDetail, 'closed')

      setTimeout(() => {
        this.selectStack.emit(undefined)
        this.renderer.removeClass(stackDetail, 'closed')

      }, 300)
    }


  }
}
