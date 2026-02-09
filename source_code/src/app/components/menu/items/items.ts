import {Component, computed, inject} from '@angular/core';
import {AppStore} from '@App/app.store';
import {NgClass} from '@angular/common';
import {MENU_ITEMS, MenuItem} from '@App/models';
import {Translated} from '@App/components/translated';

@Component({
  selector: 'menu-items',
  imports: [
    NgClass,
    Translated
  ],
  templateUrl: './items.html',
  styleUrl: './items.scss',
})
export class Items {

  appStore = inject(AppStore);

  menu_items = MENU_ITEMS;

  currentItem = computed(() => this.appStore.menu().currentItem.label);

  item_hover_class = computed(() => this.appStore.currentLanguage() === 'en' ? 'item-hover-en' : 'item-hover-fr');

  setCurrentItem(item: MenuItem) {
    this.appStore.setCurrentMenuItem(item);
    if (this.appStore.menu().opened) this.appStore.toggleMenuOpened();
  }

}
