import {Component, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'translated',
  imports: [
    TranslatePipe
  ],
  templateUrl: './translated.html',
  styleUrl: './translated.scss',
})
export class Translated {
  value = input.required<string>();
}
