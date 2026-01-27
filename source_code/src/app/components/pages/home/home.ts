import {Component, inject} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'home',
  imports: [
    TranslatePipe
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  translate = inject(TranslateService);

  protected switchLang(lang: string) {
    this.translate.use(lang);
  }
}
