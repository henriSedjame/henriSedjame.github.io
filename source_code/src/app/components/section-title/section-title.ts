import {Component, input} from '@angular/core';
import {Translated} from '@App/components';

@Component({
  selector: 'section-title',
  imports: [
    Translated
  ],
  templateUrl: './section-title.html',
  styleUrl: './section-title.css',
})
export class SectionTitle {

  title_key = input.required<string>();

}
