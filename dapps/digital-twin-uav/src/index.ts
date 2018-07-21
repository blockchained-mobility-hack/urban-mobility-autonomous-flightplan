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
import { UAVListComponent } from './components/list/list';
import { UAVDetailComponent } from './components/detail/detail';
import { UAVCreateComponent } from './components/create/create';
import { UAVDispatcherService } from './dispatcher/uav';
export { UAVDispatcher, UAVDispatcherService } from './dispatcher/uav';

import { AgmCoreModule } from '@agm/core';

import * as FlightPlan from 'flightplan';

import {
  TaskLibModule,
  TaskTranslations
} from 'task';

/**************************************************************************************************/

function getRoutes(): Routes {
  return buildModuleRoutes(
    `uavtwin.${ getDomainName() }`,
    RootComponent,
    getDashboardRoutes([
      {
        path: ``,
        component: UAVListComponent,
        data: {
          state: 'list',
          navigateBack: true
        }
      },
      {
        path: `create`,
        component: UAVCreateComponent,
        data: {
          state: 'create',
          navigateBack: true
        }
      },
      {
        path: `:address`,
        data: {
          state: 'contract',
          navigateBack: true
        },
        children: [

          {
            path: 'flightplan-create',
            data: {
              state: 'contract',
              navigateBack: true
            },
            component: FlightPlan.FlightPlanCreateComponent,
          },
          {
            path: ``,
            data: {
              state: 'contract',
              navigateBack: true
            },
            component: UAVDetailComponent
          },          
          {
            path: '**',
            data: {
              state: 'contract',
              navigateBack: true
            },
            component: DAppLoaderComponent,
          }
        ]
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
      TaskLibModule,
    ],
    providers: [
      Translations,
      FlightPlan.FlightPlanTranslations,
      UAVDispatcherService
    ],
  };
      config.imports.push(AgmCoreModule.forRoot({
    apiKey: 'AIzaSyAmANSz_f9vFxV-1mzjwbUKTGMBL0en1hE'
  }));
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
      UAVListComponent,
      UAVCreateComponent,
      UAVDetailComponent,
      FlightPlan.FlightPlanCreateComponent,
      FlightPlan.FlightPlanDetailComponent
    ];
  }

  return config;
}

@NgModule(getConfig(true))
export class DispatcherModule {
  constructor() { }
}

@NgModule(getConfig(false))
class UAVModule {
  constructor(private translations: Translations,
        private flightplanTranslations: FlightPlan.FlightPlanTranslations) { }
}

export async function startDApp(container, dbcpName) {
  const ionicAppEl = createIonicAppElement(container, dbcpName);
  
  // Add seed class name to the ion-app / .evan-dapp element for generalized styling
  ionicAppEl.className += ' dt-uav-style';

  await startAngularApplication(UAVModule, getRoutes());

  container.appendChild(ionicAppEl);
}
