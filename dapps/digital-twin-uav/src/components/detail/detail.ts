import {
  getDomainName
} from 'dapp-browser';

import {
  Component,     // @angular/core
  DomSanitizer,
  ChangeDetectorRef, ViewChild
} from 'angular-libs';

import {
  AnimationDefinition,
  AsyncComponent,
  createOpacityTransition,
  createRouterTransition,
  EvanAlertService,
  EvanBCCService,
  EvanCoreService,
  EvanTranslationService,
  EvanRoutingService,
  EvanBcService,
  EvanToastService,
  EvanDescriptionService,
  EvanQueue,
  QueueId
} from 'angular-core';

import {
  Ipld,
  prottle
} from 'bcc';

/**************************************************************************************************/

@Component({
  selector: 'uavdetail',
  templateUrl: 'detail.html',
  animations: [ ]
})

/**
 * Overview over all created uav by the current user.
 */
export class UAVDetailComponent extends AsyncComponent {


  private contractAddress;
  private allowedToCreateFlightPlans;
  private dbcp;
  private metadata;


  /**
   * loaded business center instance
   */
  private bc: any;


  /**
   * Includes all flight plans for the UAV contract and its details
   */
  private flightPlans: Array<any> = [ ];

  /**
   * all flightplans that are beeing created for the current uav
   */
  private queueFlightPlans: Array<any> = [ ];
  /**
   * QueueId instance to load queue entries from flightplan dispatcher and to watch for updates
   */
  private flightplanQueueId: QueueId;

  /**
   * function to stop queue listening
   */
  private clearQueue: Function;

    /**
   * list entries component
   */
  @ViewChild('listEntryComponent') listEntryComponent: any;
  constructor(
    private _DomSanitizer: DomSanitizer,
    private alertService: EvanAlertService,
    private bcc: EvanBCCService,
    private bcService: EvanBcService,
    private core: EvanCoreService,
    private descriptionService: EvanDescriptionService,
    private ref: ChangeDetectorRef,
    private routingService: EvanRoutingService,
    private queueService: EvanQueue,
    private translateService: EvanTranslationService,
    private toastService: EvanToastService
  ) {
    super(ref);
  }

  /**
   * Setup 
   */
  async _ngOnInit() {
    // get contract address from url
    this.contractAddress = this.routingService.getHashParam('address');
      
    // wath the window size when it changes, detect changes
    this.core.utils.windowSize(() => {
      this.ref.detectChanges();
    });

    // is the user the owner and is permitted to create flightplans?
    this.allowedToCreateFlightPlans = await this.bcc.rightsAndRoles.hasUserRole(
      this.contractAddress,
      this.core.activeAccount(),
      this.core.activeAccount(),
      0 // => owner
    );

    // load dbcp
    this.dbcp = await this.descriptionService.getDescription(this.contractAddress);

        try {
      // load the technical informations
      this.metadata = await this.bcc.dataContract.getEntry(
        this.contractAddress,
        'technicalData',
        this.core.activeAccount()
      );

      // add translation for dapp-wrapper header
      this.translateService.addSingleTranslation(this.contractAddress, this.metadata.name);
    } catch (ex) {
      this.core.utils.log(this.core.utils.getErrorLog(ex));
      // show error for user
      try {
        this.alertService.showAlert(
          '_uavdigitaltwin.generic-error',
          this.core.utils.getErrorLog(ex),
        );
      } catch (ex) { }
    }
  }

  _ngOnDestroy() {
  }

  async reloadFlightPlans() {
    if(!this.listEntryComponent.loading) {
      this.toastService.showToast({
        message: '_uavdigitaltwin.reload-flightplans',
        duration: 2000
      });

      this.flightPlans = [ ];
      await this.listEntryComponent.refresh();
    }
  }

  async loadFlightPlans(contractAddresses: Array<string>) {
    if (contractAddresses.length > 0) {
      // iterate through all address and load the metadata and subtasks for status display
      await prottle(10, contractAddresses.map(contractAddress => async () => {
        // load metadata
        const metadata = await this.bcc.dataContract.getEntry(
          contractAddress,
          'technicalData',
          this.core.activeAccount()
        );

        // load contract state
        const contractState = await this.bcc.executor.executeContractCall(
          this.bcc.contractLoader.loadContract('BaseContract', contractAddress),
          'contractState'
        );

        // push it into the flightplans array
        this.flightPlans.push({ contractAddress, metadata, contractState });

        // sort the flightplans with the order of the incoming contractAddresses
        this.flightPlans.sort((a, b) => {
          return contractAddresses.indexOf(a.contractAddress) - contractAddresses.indexOf(b.contractAddress)
        });

        this.ref.detectChanges();
      }));
    }
  }

  createNewFlightPlan() {
    this.routingService.navigate(
      `./flightplan-create`,
      false,
      { parent : this.contractAddress }
    );
  }

  openFlightPlan(flightplan: any) {
    if (!flightplan.loading) {
      this.routingService.navigate(`./flightplan/${ flightplan.contractAddress }`);
    }
  }  
}