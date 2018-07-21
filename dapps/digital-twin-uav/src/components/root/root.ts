import {
  getDomainName
} from 'dapp-browser';

import {
  Component, OnInit, OnDestroy,  // @angular/core
  DomSanitizer,
  ChangeDetectorRef,
  ElementRef
} from 'angular-libs';

import {
  createOpacityTransition,
  createRouterTransition,
  EvanBCCService,
  EvanBcService,
  EvanCoreService,
  EvanDescriptionService,
  EvanMailboxService,
  EvanRoutingService,
  AsyncComponent,
  AnimationDefinition
} from 'angular-core';

/**************************************************************************************************/

@Component({
  selector: 'uav-twin',
  templateUrl: 'root.html',
  animations: [
    createOpacityTransition(),
    createRouterTransition([
      new AnimationDefinition('overview', '=>', 'contract', 'right'),
      new AnimationDefinition('contract', '=>', 'overview', 'left'),
    ])
  ]
})

/**
 * Root component for handling routing and animations
 */
export class RootComponent extends AsyncComponent {
  /**
   * handle route changing
   */
  private watchRouteChange: Function;

  constructor(
    private core: EvanCoreService,
    private bcc: EvanBCCService,
    private descriptionService: EvanDescriptionService,
    private mailboxService: EvanMailboxService,
    private _DomSanitizer: DomSanitizer,
    private bcService: EvanBcService,
    private routingService: EvanRoutingService,
    private ref: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {
    super(ref);
  }

  async _ngOnInit() {
    await this.bcc.initialize((accountId) => this.bcc.globalPasswordDialog(accountId));

    this.watchRouteChange = this.routingService.subscribeRouteChange(() => this.ref.detectChanges());

    this.core.finishDAppLoading();
  }

  async _ngOnDestroy() {
    this.watchRouteChange && this.watchRouteChange();
  }
}
