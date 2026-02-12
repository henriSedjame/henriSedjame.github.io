import {Component, computed, effect, ElementRef, inject, input, output, Renderer2, viewChild} from '@angular/core';
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

  hovered = input(false)

  stack_icon = viewChild<ElementRef<HTMLDivElement>>('stack_icon')

  stack_detail = viewChild<ElementRef>('stack_detail')

  isLanguage = computed(() => this.stack().type === 'Language')

  selectStack = output<TechStack | undefined>()

  renderer = inject(Renderer2)

  icon_class = computed(() => {
    let c = ''
    if(this.isLanguage()) {c += 'language' }
    if(this.hovered()) {c += ' hovered' }
    if(this.active()) {c += ' active' }
    return c
  })
  _ = effect(() => {
    let stackIcon = this.stack_icon()?.nativeElement;
    let stackDetail = this.stack_detail()?.nativeElement;

    if (stackIcon && stackDetail) {

      let rect = stackIcon?.getBoundingClientRect()
      let viewportWidth = window.visualViewport?.width || window.screen.width

      let pd = 0

      if (viewportWidth >= 1600) {
        pd = viewportWidth * 0.1
      } else if (viewportWidth >= 1200) {
        pd = viewportWidth * 0.075
      } else if (viewportWidth >= 992) {
        pd = viewportWidth * 0.05
      }

      let top = ((rect?.y || 0)) + 'px';
      let left = ((rect?.left || 0) - pd ) + 'px';

      let width = `${stackIcon?.offsetWidth}px`;
      let height = `${stackIcon?.offsetHeight}px`;

      stackDetail.style.setProperty('--position-top', top)
      stackDetail.style.setProperty('--position-left', left)
      stackDetail.style.setProperty('--width', width)
      stackDetail.style.setProperty('--height', height)

      if (this.active()) {

        this.renderer.setStyle(stackDetail, 'position', 'absolute')
        this.renderer.addClass(stackDetail, 'glass')
        this.renderer.addClass(stackDetail, 'bordered')
        this.renderer.setStyle(stackDetail, 'border-radius', '4px')

        this.renderer.setStyle(stackDetail, 'z-index', '2')
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
