import {
  getDomainName
} from 'dapp-browser';

import {
  Injectable,
  Component, OnInit, Input,            // @angular/core
  Validators, FormBuilder, FormGroup,  // @angular/forms
  DomSanitizer
} from 'angular-libs';

import {
  EvanBCCService,
  EvanBcService,
  EvanCoreService,
  QueueDispatcher,
  QueueSequence,
  SingletonService,
  EvanDescriptionService,
} from 'angular-core';

import {
  translations
} from '../i18n/registry';

/**************************************************************************************************/

@Injectable()
export class FlightPlanDispatcherService {


  public modType;
  public propType;

  constructor(
    public singleton: SingletonService,
    public core: EvanCoreService,
    public bcc: EvanBCCService,
    public descriptionService: EvanDescriptionService
  ) {

    this.modType = {
      "Set": "0xd2f67e6aeaad1ab7487a680eb9d3363a597afa7a3de33fa9bf3ae6edcb88435d",
      "Remove": "0x8dd27a19ebb249760a6490a8d33442a54b5c3c8504068964b74388bfe83458be"
    };
    this.propType = {
      "Entry": "0x84f3db82fb6cd291ed32c6f64f7f5eda656bda516d17c6bc146631a1f05a1833",
      "ListEntry": "0x7da2a80303fd8a8b312bb0f3403e22702ece25aa85a5e213371a770a74a50106"
    };
      
    return singleton.create(FlightPlanDispatcherService, this);
  }


   async createTasksForPlan(todos: any, partners = [], title: string) {
    const tasks = await this.bcc.dataContract.create(
      'tasks',
      this.bcc.core.activeAccount(),
      null
    );

    const ensDescription = await this.descriptionService.getDescription('task.evan');

    // get cryptor and data to save to my profile
    const cryptor = this.bcc.cryptoProvider.getCryptorByCryptoAlgo(
      this.bcc.dataContract.options.defaultCryptoAlgo
    );

    const envelope = {
      cryptoInfo: cryptor.getCryptoInfo(this.bcc.nameResolver.sha3(tasks.options.address)),
      public: {
        author: ensDescription.author,
        abis: {
          own: tasks.options.jsonInterface,
        },
        name: title,
        dapp: ensDescription.dapp,
        description: ensDescription.description,
        i18n: ensDescription.i18n,
        imgSquare: ensDescription.imgSquare,
        imgWide: ensDescription.imgWide,
        version: ensDescription.version,
        tags: ensDescription.tags
      }
    };
    
    await this.bcc.description.setDescriptionToContract(
      tasks.options.address, envelope, this.bcc.core.activeAccount()
    );

    await this.bcc.profile.addContract(
      tasks.options.address,
      envelope.public
    );

    await this.bcc.dataContract.addListEntries(
      tasks,
      'todos',
      todos,
      this.bcc.core.activeAccount(),
    );
    await this.bcc.dataContract.setEntry(tasks,
      'metadata',
      {
        type: 'task',
        created: Date.now(),
        createdby: this.bcc.core.activeAccount(),
      },
      this.core.activeAccount()
    );

    if(partners.length > 0) {

      for(let partner of partners) {
        await this.invitePartner(tasks.options.address, partner);

        // send the bmail to the invitee
        /*await this.bcc.mailbox.sendMail(
          ret,
          this.bcc.core.activeAccount(),
          partner
        );*/
      }
    }
    
    
    return tasks.options.address;
  }


  async invitePartner(contractAddress, partner) {
    // get the content sharing key
    const contentKey = await this.bcc.sharing.getKey(contractAddress, this.bcc.core.activeAccount(), '*');

    // share the contract with the user
    await this.bcc.sharing.addSharing(
      contractAddress,
      this.bcc.core.activeAccount(),
      partner,
      '*',
      0,
      contentKey,
    );

    const hashKey = await this.bcc.sharing.getHashKey(contractAddress, this.bcc.core.activeAccount());
    await this.bcc.sharing.ensureHashKey(contractAddress, this.bcc.core.activeAccount(), partner, hashKey);

            // invite user to contract
    await this.bcc.dataContract.inviteToContract(
      null,
      contractAddress,
      this.bcc.core.activeAccount(),
      partner
    );
  }


  async doKeyExchange(targetAcc: string, alias: string) {
    const myAccountId = this.core.activeAccount();
    let profile = this.bcc.getProfileForAccount(targetAcc);

    const targetPubKey = await profile.getPublicKey();
    const commKey = await this.bcc.keyExchange.generateCommKey();
    await this.bcc.keyExchange.sendInvite(targetAcc, targetPubKey, commKey, {});

    // add key to profile
    await this.bcc.profile.addContactKey(
      targetAcc,
      'commKey',
      commKey
    );
    await this.bcc.profile.addProfileKey(
      targetAcc, 'alias', alias
    );
  }

  getTasksForDepartment(department) {
    switch (department) {
      case "dfs":
      return [{
            "id": this.core.utils.generateID(),
            "alias": 'Flughöhe nicht über 300ft',
            "order": 1000,
            "createdFrom": this.core.activeAccount(),
            "criteria": [],
            "required": {},
          },
          {
            "id": this.core.utils.generateID(),
            "alias": 'Fluggebiet nicht in Flughafennähe',
            "order": 1000,
            "createdFrom": this.core.activeAccount(),
            "criteria": [],
            "required": {},
          },
          {
            "id": this.core.utils.generateID(),
            "alias": 'Fluggebiet nicht in Flughafennähe',
            "order": 1000,
            "createdFrom": this.core.activeAccount(),
            "criteria": [],
            "required": {},
          }];
      case "dwd":
      return [{
            "id": this.core.utils.generateID(),
            "alias": 'Kein Regen vorhanden',
            "order": 1000,
            "createdFrom": this.core.activeAccount(),
            "criteria": [],
            "required": {},
          },
          {
            "id": this.core.utils.generateID(),
            "alias": 'Windgeschwindigkeit nicht über 3m/s',
            "order": 1100,
            "createdFrom": this.core.activeAccount(),
            "criteria": [],
            "required": {},
          },
          {
            "id": this.core.utils.generateID(),
            "alias": 'Keine extremen Wettervorkommnisse',
            "order": 1200,
            "createdFrom": this.core.activeAccount(),
            "criteria": [],
            "required": {},
          }];
      case "insurance":
      return [{
            "id": this.core.utils.generateID(),
            "alias": 'Start und Endzeit liegen in der Zukunft',
            "order": 1000,
            "createdFrom": this.core.activeAccount(),
            "criteria": [],
            "required": {},
          },
          {
            "id": this.core.utils.generateID(),
            "alias": 'Police abgeschlossen',
            "order": 1100,
            "createdFrom": this.core.activeAccount(),
            "criteria": [],
            "required": {},
          },
          {
            "id": this.core.utils.generateID(),
            "alias": 'Policennummer zugewiesen',
            "order": 1200,
            "createdFrom": this.core.activeAccount(),
            "criteria": [],
            "required": {},
          }];
      default:
        // code...
        break;
    }
  }
}

export const FlightPlanDispatcher = new QueueDispatcher(
  [
    new QueueSequence(
      '_uav.dispatcher.title',
      '_uav.dispatcher.description',
      async (service: FlightPlanDispatcherService, queueEntry: any) => {
        const flightplans = queueEntry.data;
        const fpDescription = await service.descriptionService.getDescription(`flightplan.${ getDomainName() }`, true);

        for (let flightplan of flightplans) {
          const flightPlanDT = await service.bcc.dataContract.create(
            // this is the ENS of generic test twin factory
            'dt.factory.testbc.evan',
            // your own accountID as the owner
            service.core.activeAccount(),
            null,
            {
              public: fpDescription
            }
          );

          await service.bcc.profile.loadForAccount(service.bcc.profile.treeLabels.addressBook);
          // check if key exchange with the smart agents exist
          if(!await service.bcc.profile.getContactKey('0xFCE2dfF569b6f715E83934d3CfCeff777916fFC7','commKey')) {
            await service.doKeyExchange('0xFCE2dfF569b6f715E83934d3CfCeff777916fFC7', 'DWD');
          }
          if(!await service.bcc.profile.getContactKey('0x8958AED4D3a577298166526c37087578C5DB2Fd2','commKey')) {
            await service.doKeyExchange('0x8958AED4D3a577298166526c37087578C5DB2Fd2', 'DFS');
          }
          if(!await service.bcc.profile.getContactKey('0x20a6E2feD0e1518cd0a61B1946B3e9D064aB171b','commKey')) {
            await service.doKeyExchange('0x20a6E2feD0e1518cd0a61B1946B3e9D064aB171b', 'Versicherung');
          }

          await service.bcc.profile.storeForAccount(service.bcc.profile.treeLabels.addressBook);

          await Promise.all([
            service.bcc.rightsAndRoles.setOperationPermission(
              flightPlanDT,        // contract to be updated
              service.core.activeAccount(),              // account, that can change permissions
              0,                  // role id, uint8 value
              'technicalData',                // name of the object
              service.propType.Entry,         // what type of element is modified
              service.modType.Set,       // type of the modification
              true,                       // grant this capability
            ),
            service.bcc.rightsAndRoles.setOperationPermission(
              flightPlanDT,        // contract to be updated
              service.core.activeAccount(),              // account, that can change permissions
              1,                  // role id, uint8 value
              'iotaStream',                // name of the object
              service.propType.Entry,         // what type of element is modified
              service.modType.Set,       // type of the modification
              true,                       // grant this capability
            ),
            service.bcc.rightsAndRoles.setOperationPermission(
              flightPlanDT,        // contract to be updated
              service.core.activeAccount(),              // account, that can change permissions
              0,                  // role id, uint8 value
              'tasks',                // name of the object
              service.propType.ListEntry,         // what type of element is modified
              service.modType.Set,       // type of the modification
              true,                       // grant this capability
            ),
            service.bcc.dataContract.addListEntries(flightplan.uavContractAddress, 'flightPlans', [flightPlanDT.options.address], service.core.activeAccount()),
            service.bcc.dataContract.setEntry(flightPlanDT, 'technicalData', flightplan.technicalData, service.core.activeAccount())
          ]);

          await service.invitePartner(flightPlanDT.options.address, '0xFCE2dfF569b6f715E83934d3CfCeff777916fFC7');

          await service.bcc.profile.loadForAccount(service.bcc.profile.treeLabels.contracts);

          const tasks = await Promise.all([
            service.createTasksForPlan(service.getTasksForDepartment('dwd'), ['0xFCE2dfF569b6f715E83934d3CfCeff777916fFC7'], 'DWD Genehmigung'),
            service.createTasksForPlan(service.getTasksForDepartment('dfs'), ['0x8958AED4D3a577298166526c37087578C5DB2Fd2'], 'DFS Genehmigung'),
            service.createTasksForPlan(service.getTasksForDepartment('insurance'), ['0x20a6E2feD0e1518cd0a61B1946B3e9D064aB171b'], 'Zusage Versicherung'),
          ]);

          await service.bcc.profile.storeForAccount(service.bcc.profile.treeLabels.contracts);

          await service.bcc.dataContract.addListEntries(flightPlanDT, 'tasks', tasks, service.core.activeAccount())
        }
      }
    )
  ],
  translations,
  'FlightPlanDispatcherService'
);
