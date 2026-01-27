import {Component, computed, inject} from '@angular/core';
import {AppStore, Language} from '@App/app.store';
import {NgClass} from '@angular/common';

@Component({
  selector: 'menu-lang-selector',
  imports: [
    NgClass
  ],
  templateUrl: './lang-selector.html',
  styleUrl: './lang-selector.css',
})
export class LangSelector {
  appStore = inject(AppStore);

  isFrEnabled = computed(() => this.appStore.currentLanguage() === 'fr');

  isEnEnabled = computed(() => this.appStore.currentLanguage() === 'en');

  switchLanguage(lang: Language) {
    this.appStore.setLanguage(lang);
  }
}
