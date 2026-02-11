import {Component} from '@angular/core';
import {Intro} from '@Pages/home/intro';
import {Stacks} from '@Pages/home/stacks';

@Component({
  selector: 'home',
  imports: [
    Intro,
    Stacks
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
}
