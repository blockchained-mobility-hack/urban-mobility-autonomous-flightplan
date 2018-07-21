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


import * as FlightPlan from 'flightplan';


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
            path: ``,
            data: {
              state: 'contract',
              navigateBack: true
            },
            component: UAVDetailComponent
          },
          {
            path: 'flightplan-create',
            data: {
              state: 'contract',
              navigateBack: true
            },
            component: FlightPlan.FlightPlanCreateComponent,
          },
          {
            path: 'flightplan',
            data: {
              state: 'contract',
              navigateBack: true
            },
            children: [
              {
                path: `:address`,
                data: {
                  state: 'contract',
                  navigateBack: true
                },
                component: FlightPlan.FlightPlanDetailComponent
              }
            ]
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
    ],
    providers: [
      Translations,
      UAVDispatcherService
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
class SeedModule {
  constructor(private translations: Translations) { }
}

export async function startDApp(container, dbcpName) {
  const ionicAppEl = createIonicAppElement(container, dbcpName);
  
  // Add seed class name to the ion-app / .evan-dapp element for generalized styling
  ionicAppEl.className += ' dt-uav-style';

  await startAngularApplication(SeedModule, getRoutes());

  container.appendChild(ionicAppEl);
}
