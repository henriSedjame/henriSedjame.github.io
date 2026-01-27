import {Component, computed, inject} from '@angular/core';
import {AppStore} from '@App/app.store';
import {NgClass} from '@angular/common';
import {MENU_ITEMS, MenuItem} from '@App/models/MenuItems';

@Component({
  selector: 'menu-items',
  imports: [
    NgClass
  ],
  templateUrl: './items.html',
  styleUrl: './items.css',
})
export class Items {

  appStore = inject(AppStore);

  menu_items = MENU_ITEMS;

  currentItem = computed(() => this.appStore.menu().currentItem.label);

  setCurrentItem(item: MenuItem) {
    this.appStore.setCurrentMenuItem(item);
  }
}
