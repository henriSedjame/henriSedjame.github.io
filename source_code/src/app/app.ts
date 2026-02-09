import {Component, ElementRef, HostListener, viewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Background} from '@Components/background';
import {Layout} from '@Components/layout';
import {Menu} from '@Components/menu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Background, Layout, Menu],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  app = viewChild<ElementRef<HTMLElement>>('app');

  @HostListener('mousemove', ['$event'])
  mousemove(event: MouseEvent) {
    this.app()?.nativeElement.style.setProperty('--bg-light-x', event.clientX + 'px');
    this.app()?.nativeElement.style.setProperty('--bg-light-y', event.clientY + 'px');
  }

}
