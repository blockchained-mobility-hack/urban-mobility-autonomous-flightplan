import {
  getDomainName
} from 'dapp-browser';

import {
  NgModule,                    // @angular/core
  CommonModule,                // @angular/common
  RouterModule, Routes,        // @angular/router
  IonicModule, IonicApp,       // ionic-angular
  BrowserAnimationsModule,     // @angular/platform-browser/animations
} from 'angular-libs';

import {
  AngularCore,
  BootstrapComponent,
  createIonicAppElement,
  DAppLoaderComponent,
  EvanBcService,
  getDashboardRoutes,
  buildModuleRoutes,
  startAngularApplication,
} from 'angular-core';

import { Translations } from './i18n/registry';
import { RootComponent } from './components/root/root';
import { SeedComponent } from './components/seed/seed';
import { SeedDispatcherService } from './dispatcher/seed';
export { SeedDispatcher, SeedDispatcherService } from './dispatcher/seed';
/**************************************************************************************************/

function getRoutes(): Routes {
  return buildModuleRoutes(
    `seed.${ getDomainName() }`,
    RootComponent,
    getDashboardRoutes([
      {
        path: ``,
        component: SeedComponent,
        data: {
          state: 'seed',
          navigateBack: true
        }
      },
    ])
  );
}

/**
 * Returns the module configuration for the normal or dispatcher module.
 * In case of the dispatcher module, Router configurations and BrowserModule imports are excluded
 * to load the module during runtime by the dispatcher service.
 *
 * @param isDispatcher  boolean value if the config is used for the dispatcher module
 */
function getConfig(isDispatcher?: boolean) {
  let config: any = {
    imports: [
      CommonModule,
      AngularCore,
    ],
    providers: [
      Translations,
      SeedDispatcherService
    ],
  };

  if (!isDispatcher) {
    config.imports.unshift(BrowserAnimationsModule);
    config.imports.unshift(RouterModule.forRoot(getRoutes(), { enableTracing: false, }));
    config.imports.push(IonicModule.forRoot(BootstrapComponent, {
      mode: 'md'
    }));

    config.bootstrap = [
      IonicApp
    ];

    config.declarations = [
      BootstrapComponent,
      RootComponent,
      SeedComponent,
    ];
  }

  return config;
}

@NgModule(getConfig(true))
export class DispatcherModule {
  constructor() { }
}

@NgModule(getConfig(false))
class SeedModule {
  constructor(private translations: Translations) { }
}

export async function startDApp(container, dbcpName) {
  const ionicAppEl = createIonicAppElement(container, dbcpName);
  
  // Add seed class name to the ion-app / .evan-dapp element for generalized styling
  ionicAppEl.className += ' seed-style';

  await startAngularApplication(SeedModule, getRoutes());

  container.appendChild(ionicAppEl);
}
