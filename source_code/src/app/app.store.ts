import {signalStore, withHooks, withMethods, withState} from '@ngrx/signals';
import {updateState, withDevtools} from '@angular-architects/ngrx-toolkit';
import {TranslateService} from '@ngx-translate/core';
import {inject} from '@angular/core';
import {MENU_ITEMS, MenuItem} from '@App/models/MenuItems';
import {Router} from '@angular/router';

export type Language = 'en' | 'fr';


export type AppState = {
  currentLanguage: Language;
  menu: {
    opened: boolean;
    currentItem: MenuItem;
  }
}

export const initialAppState: AppState = {
  currentLanguage: 'en',
  menu: {
    opened: true,
    currentItem: MENU_ITEMS[0],
  }
}

export const AppStore = signalStore(
  {providedIn: 'root'},
  withDevtools('app-store'),
  withState(initialAppState),
  withMethods((
    state,
    translate = inject(TranslateService),
    router = inject(Router)
  ) => ({

    setLanguage: (language: Language) => {
      updateState(state, 'set currentLanguage', {currentLanguage: language});
      translate.use(language);
    },

    toggleMenuOpened: () => {
      updateState(state, 'toggle menu opened', {
        menu: {
          ...state.menu(),
          opened: !state.menu().opened
        }
      })
    },

    setCurrentMenuItem: (item: MenuItem) => {

      router.navigate([item.route]).then(_ => {

        updateState(state, 'set current menu item', {
            menu: {
              ...state.menu(),
              currentItem: item
            }
          }
        )
      });
    },

  })),
  withHooks((state, translate = inject(TranslateService)) => ({
    onInit: () => {
      translate.use(state.currentLanguage());
    }
  }))
)
