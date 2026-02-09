import {Component} from '@angular/core';
import {Intro} from '@Pages/home/intro';
import {Stacks} from '@Pages/home/stacks';
import {Space} from '@App/components';

@Component({
  selector: 'home',
  imports: [
    Intro,
    Stacks,
    Space
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
}
