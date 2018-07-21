import {
  Injectable,      // @angular/core
} from 'angular-libs';

import {
  EvanTranslationService
} from 'angular-core';

import { en } from './en';
import { de } from './de';

export const translations = {
  en, de
};


@Injectable()
export class FlightPlanTranslations {
  constructor(translate: EvanTranslationService) {
    translate.setTranslation('en', de);
    translate.setTranslation('de', de);
  }
}
