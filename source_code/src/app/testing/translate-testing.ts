import {Provider} from '@angular/core';
import {Observable, of} from 'rxjs';
import {provideTranslateService, TranslateLoader} from '@ngx-translate/core';

/**
 * Dictionnaire de test volontairement distinct des fichiers `public/i18n/*.json` :
 * les assertions comparent le texte rendu à ces valeurs, jamais à la clé brute.
 */
export const TEST_TRANSLATIONS = {
  home: {
    title: 'titre-home',
    subtitle: 'sous-titre-home',
    description: 'description-home',
    technical_skills: 'competences-techniques',
  },
  close: 'fermer-test',
};

class TranslateTestingLoader extends TranslateLoader {
  override getTranslation(_lang: string): Observable<typeof TEST_TRANSLATIONS> {
    return of(TEST_TRANSLATIONS);
  }
}

/**
 * Provider de traduction pour les tests : loader synchrone (`of`), donc aucun `HttpClient`
 * n'est requis et les traductions sont disponibles dès le constructeur de `TranslateService`.
 */
export const provideTranslateTesting = (): Provider[] =>
  provideTranslateService({
    lang: 'fr',
    fallbackLang: 'fr',
    loader: {provide: TranslateLoader, useClass: TranslateTestingLoader},
  });
