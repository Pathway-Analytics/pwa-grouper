import { SQL } from '../sql';
import  { type AdminAreaType, AdminAreaTypeType, AdminAreaTypeType as AreaType  } from '../types/adminArea';
import { EventBridge } from 'aws-sdk';
import { Fn } from 'aws-cdk-lib';

/**
 * AdminArea class
 * 
 * @class
 */
export class AdminArea implements AdminAreaType {
    // import the AdminAreaType interface
    code!: string;
    name!: string;
    parentCode!: string;
    lastChanged!: Date;
    type: AdminAreaTypeType = AreaType.NOT_KNOWN;
    isActive!: boolean;
    lat?: number | undefined;
    lng?: number | undefined;

    constructor(adminArea: AdminAreaType) {
        Object.assign(this, adminArea);
    }

    /**
    * Method to get adminArea by id or code
    * 
    * @param {string} code - The code of the area
    * @returns {Promise<AdminArea>} adminArea - The adminArea object
    */
    static async getByCode( code: string): Promise<AdminAreaType> {
    
        try {
            const result = await SQL.DB
                .selectFrom('adminArea')
                .selectAll()
                .where((eb) =>
                    eb('code', '=', code)
                )
                .executeTakeFirst();

            if (!result?.code) {
                return {} as any;
            }

                // Add other properties as needed

            const adminArea =  new AdminArea(result);
            return adminArea;
        } catch (error) {
            console.error('Error in user class getByIdOrCode', error);
        throw error;
        }
    }    

    /**
    * Method to create or update the user object
    * @param {UserType} User - The user object to create or update
    * @returns {Promise<CreateUpdateResponse>} UserType - The new user object created or updated
    */
    static async createUpdate(newAdminArea: AdminAreaType): Promise<AdminAreaType> {
        let adminArea: AdminAreaType;
        if (newAdminArea.code && newAdminArea.name && newAdminArea.parentCode)  {
            // allows for null 
            throw new Error("You must provide a code, name and parentCode to create or update an adminArea");
        } else {
            const adminArea: AdminArea = {
                code: newAdminArea.code,
                name: newAdminArea.name,
                parentCode: newAdminArea.parentCode,
                lastChanged: new Date(), // lastChanged: set to now,
                type : getAdminAreaType(newAdminArea.code),
                isActive: newAdminArea.isActive,
                lat: newAdminArea.lat,
                lng: newAdminArea.lng            
            };
        
            try {
                const response = await SQL.DB
                .insertInto('adminArea')
                .values({
                    code: adminArea.code,
                    name: adminArea.name,
                    parentCode: adminArea.parentCode,
                    lastChanged: adminArea.lastChanged,
                    type: adminArea.type,
                    isActive: adminArea.isActive,
                    lat: adminArea.lat,
                    lng: adminArea.lng
                })
                .onConflict((oc) => oc
                    .column('code')
                .doUpdateSet({
                    name: adminArea.name,
                    parentCode: adminArea.parentCode,
                    lastChanged: adminArea.lastChanged,
                    type: adminArea.type,
                    isActive: adminArea.isActive,
                    lat: adminArea.lat,
                    lng: adminArea.lng
                })
                )
                .execute();
                return adminArea

            } catch (error) {
                console.error('Error in adminArea class createUpdate: ',error);
                throw new Error('Internal Server Error' + error);
            };
        }
    }

    /**
    * Method to start adminArea spider
    * 
    * @param {string} code - The code of the within area
    * @returns {Promise<void>} - The adminArea spider
    */
    static async startAdminAreaSpider(within: string): Promise<void> {
        const eventBridge = new EventBridge();
        // trigger the startAdminAreaSpider eventbus event
        const childEvent = {
            EventBusName: Fn.importValue("EventBusName"),
            Source: "startAdminAreaSpider",
            DetailType: "Start Admin Area Spider",
            Detail: JSON.stringify({ entityCode: within, lastItem: false }),
        };
        await eventBridge.putEvents({ Entries: [childEvent] }).promise();
    }

    /**
    * Method to start adminArea spider for a subset of adminAreas
    * 
    * @param {string} code - The code of the within area
    * @returns {Promise<void>} - The adminArea spider
    */
    static async adhocAdminAreaSpider(within: string): Promise<void> {
        const eventBridge = new EventBridge();
        // trigger the startAdminAreaSpider eventbus event
        const childEvent = {
            EventBusName: Fn.importValue("EventBusName"),
            Source: "fetchChildren",
            DetailType: "Ad hoc Fetch Children Within",
            Detail: JSON.stringify({ entityCode: within, lastItem: false }),
        };
        await eventBridge.putEvents({ Entries: [childEvent] }).promise();
    }
}

function getAdminAreaType(code: string): AdminAreaTypeType {
    switch (code.substring(1, 2)) {
        case "01":
            return AreaType.LSOA_01;
        case "06":
            return AreaType.UNITARY_AUTHORITY_06;
        case "07":
            return AreaType.NON_MET_DISTR_07;
        case "08":
            return AreaType.MET_DISTR_08;
        case "09":
            return AreaType.LONDON_BOROUH_09;
        case "10":
            return AreaType.COUNTY_10;
        case "11":
            return AreaType.MET_COUNTY_11;
        case "12":
            return AreaType.REGION_12;    
        case "92":
            return AreaType.COUNTRY_92;
        default:
            return AreaType.NOT_KNOWN;
    }
}