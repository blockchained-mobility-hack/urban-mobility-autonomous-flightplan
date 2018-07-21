import {
  getDomainName
} from 'dapp-browser';

import {
  Component,     // @angular/core
  DomSanitizer,
  ChangeDetectorRef
} from 'angular-libs';

import {
  AnimationDefinition,
  AsyncComponent,
  createOpacityTransition,
  createRouterTransition,
  EvanAlertService,
  EvanBCCService,
  EvanCoreService,
  EvanQrCodeService,
  EvanRoutingService,
  EvanBcService,
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
  selector: 'uavlist',
  templateUrl: 'list.html',
  animations: [ ]
})

/**
 * Overview over all created uav by the current user.
 */
export class UAVListComponent extends AsyncComponent {

  bcAddress: string = 'uavtwin.evan';

  digitalTwinList: any = [];
  digitalTwins: any = [];
  constructor(
    private _DomSanitizer: DomSanitizer,
    private alertService: EvanAlertService,
    private bcc: EvanBCCService,
    private bcService: EvanBcService,
    private core: EvanCoreService,
    private descriptionService: EvanDescriptionService,
    private qrCodeService: EvanQrCodeService,
    private ref: ChangeDetectorRef,
    private routingService: EvanRoutingService,
    private queueService: EvanQueue
  ) {
    super(ref);
  }

  /**
   * Setup 
   */
  async _ngOnInit() {
    await this.loadContractList();
    await this.loadMetadataForDigitalTwins();
  }

  _ngOnDestroy() {
  }

  async loadMetadataForDigitalTwins() {
     if (this.digitalTwinList.length) {
      this.ref.detectChanges();

      const addressesToLoad = this.digitalTwinList;
      
      // load the next 10 contracts simultaneously
      await prottle(10, addressesToLoad.map(contractAddress => async () => {
        try {
          // load dbcp definition and contract address
          const metadata = await this.bcc.dataContract.getEntry(
            contractAddress,
            'technicalData',
            this.core.activeAccount()
          );

          // push the loaded data into the uavs array
          this.digitalTwins.push({ contractAddress, metadata });
          // sort the uavs with the contractlist order
          this.digitalTwins.sort((a, b) => 
            this.digitalTwinList.indexOf(a.contractAddress) -
            this.digitalTwinList.indexOf(a.contractAddress)
          );
          // display the updates
          this.ref.detectChanges();
        } catch (ex) {
          // remove the contract from the list if we can't load it
          this.digitalTwinList.splice(this.digitalTwinList.indexOf(contractAddress), 1);

          // log the error as warning
          this.core.utils.log(this.core.utils.getErrorLog(ex), 'warning');
        }
      }));

      this.ref.detectChanges();
    }
  }


  navigateToUAVCreate() {
    console.log('switch to cration of digital twin');
  }

  async loadContractList() {
    // load all contract addresses for my account, purge the crypto info and apply the contracts to
    // the contract list
    const contracts = (await this.bcc.profile.getBcContracts(this.bcAddress)) || { };
    Ipld.purgeCryptoInfo(contracts);
    this.digitalTwinList = Object.keys(contracts);
  }
}