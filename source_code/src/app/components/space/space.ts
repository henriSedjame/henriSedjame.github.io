import {Component, computed, input} from '@angular/core';
import {NgStyle} from '@angular/common';

@Component({
  selector: 'space',
  imports: [
    NgStyle
  ],
  templateUrl: './space.html',
  styleUrl: './space.scss',
})
export class Space {
  height = input(10)
  width = input(10)

  space = computed(() => ({
    height: `${this.height()}px`,
    width: `${this.width()}px`,
  }));

}
