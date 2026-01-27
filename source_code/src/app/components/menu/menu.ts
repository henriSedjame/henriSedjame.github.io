import {Component, inject} from '@angular/core';
import {Title} from './title';
import {Items} from './items';
import {AppStore} from '@App/app.store';
import {Icon} from '@Components/menu/icon';
import {LangSelector} from '@Components/menu/lang-selector';

@Component({
  selector: 'app-menu',
  imports: [
    Title,
    Items,
    Icon,
    LangSelector
  ],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {

  appStore = inject(AppStore);



}
