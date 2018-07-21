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

import { FlightPlanTranslations } from './i18n/registry';
import { RootComponent } from './components/root/root';
import { FlightPlanDetailComponent } from './components/detail/detail';
import { FlightPlanCreateComponent } from './components/create/create';
import { FlightPlanDispatcherService, FlightPlanDispatcher } from './dispatcher/flightplan';

// defined exports to use the components and the module from the uav-digitaltwin dapp and to export
// the dispatcher stuff
export {
  FlightPlanDetailComponent,
  FlightPlanCreateComponent,
  FlightPlanDispatcherService,
  FlightPlanDispatcher,
  FlightPlanTranslations
}


/**************************************************************************************************/

function getRoutes(): Routes {
  return buildModuleRoutes(
    `uavflightplan.${ getDomainName() }`,
    RootComponent,
    getDashboardRoutes([
      {
        path: ``,
        component: FlightPlanCreateComponent,
        data: {
          state: 'list',
          navigateBack: true
        }
      },
      {
        path: `:address`,
        component: FlightPlanDetailComponent,
        data: {
          state: 'list',
          navigateBack: true
        }
      }
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
      FlightPlanTranslations,
      FlightPlanDispatcherService
    ],
    exports: []
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
      FlightPlanDetailComponent,
      FlightPlanCreateComponent
    ];
  }

  config.exports.push(
    FlightPlanCreateComponent
  );
  config.exports.push(
    FlightPlanDetailComponent
  );
  return config;
}

@NgModule(getConfig(true))
export class DispatcherModule {
  constructor() { }
}

@NgModule(getConfig(false))
class FlightPlanModule {
  constructor(private translations: FlightPlanTranslations) { }
}

export async function startDApp(container, dbcpName) {
  const ionicAppEl = createIonicAppElement(container, dbcpName);
  
  // Add seed class name to the ion-app / .evan-dapp element for generalized styling
  ionicAppEl.className += ' flightplan-style';

  await startAngularApplication(FlightPlanModule, getRoutes());

  container.appendChild(ionicAppEl);
}
