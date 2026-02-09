import {Component, computed, inject} from '@angular/core';
import {AppStore} from '@App/app.store';
import {NgClass} from '@angular/common';
import {Language} from '@App/models';

@Component({
  selector: 'menu-lang-selector',
  imports: [
    NgClass
  ],
  templateUrl: './lang-selector.html',
  styleUrl: './lang-selector.scss',
})
export class LangSelector {
  appStore = inject(AppStore);

  isFrEnabled = computed(() => this.appStore.currentLanguage() === 'fr');

  isEnEnabled = computed(() => this.appStore.currentLanguage() === 'en');

  switchLanguage(lang: Language) {
    this.appStore.setLanguage(lang);
    if (this.appStore.menu().opened) this.appStore.toggleMenuOpened();
  }
}
