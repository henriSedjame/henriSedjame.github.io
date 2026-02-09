import {Component, computed, inject} from '@angular/core';
import {AppStore} from '@App/app.store';
import {Items} from '@Components/menu/items';
import {LangSelector} from '@Components/menu/lang-selector';

@Component({
  selector: 'menu-icon',
  imports: [
    Items,
    LangSelector
  ],
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
})
export class Icon {
  appStore = inject(AppStore);

  isMenuOpened = computed(() => this.appStore.menu().opened);

  toggleMenu() {
    this.appStore.toggleMenuOpened();
  }
}
