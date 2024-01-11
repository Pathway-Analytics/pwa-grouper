import { EventBridge } from 'aws-sdk';
import { Fn } from 'aws-cdk-lib';
import { AdminArea } from '@pwa-grouper/core/classes/adminArea';
import { AdminAreaType, AdminAreaTypeType as AdminArea_Type, type AdminAreaTypeType } from '@pwa-grouper/core/types/adminArea';

// Fetches a list of child entities belonging to a collection within a parent entity
// Called from eventEntityFetchQueue Target
// Called from startAdminAreaSpider Target

// for example: {['E01'], E06000001, false} Fetch all LSOAs within E06000001 (Unitary Authority) 
// for example: {['E06','E07','E08','E09'], E12000001, false} Fetch all UAs, NMD, MD, LBs within E12000001 (Region) 
// for example: {['E10','E11','E12'], E92000001, false} Fetch all Regions, Counties within E92000001 (Country) 
// for example: {[], E92000001, true} lastItem in the queue, indicates fetch for E92 is complete
// when within is E92* will collect E12, E11, E10
// when within is E10*, E11* E12* will collect E09, E08, E07, E06
// when within is E09, E08*, E07*, E06* will collect E01
//   if LastItem, fetchComplete(within)
// add LastItem CollectionWithin

const eventBridge = new EventBridge();

// main event handler
// receveive event params of array of entities:[], lastItem:boolean (e.g. {[E11000001, E11000002], true})
export async function main(event: AWSLambda.SQSEvent) {
    for (const record of event.Records) {
        // Process each record here
        const { collections, within, lastItem } = JSON.parse(record.body);
        if (collections.length !== 0) {
            try {
                if (lastItem) {
                    // trigger a fetchComplete event
                    triggerQueueEntityComplete(collections[0])
                } else {
                    // loop through entities
                    for (const collection of collections) {
                        // use switch statement to determine which fetch to call
                        switch (collection.substring(1, 2)) {
                            // if UA, NMD, MD, LB then fetch LSOAs (E01) within
                            case ["09", "08", "07", "06"].some(prefix => collection.startsWith(prefix)):
                                await fetchEntityRecords(["E01"], within);
                            // if CTY, MCTY, RGN then fetch UAs, NMDs, MDs, LBs within
                            case ["12", "11", "10"].some(prefix => within.startsWith(prefix)):
                                await fetchEntityRecords(["E09", "E08", "E07", "E06"], within);
                            // if CTRY then fetch Regions & Counties (E12, E11, E10) within
                            case ["92"].some(prefix => within.startsWith(prefix)):
                                await fetchEntityRecords(["E92"], within);
                                await fetchEntityRecords(["E12", "E11", "E10"], within);
                            default:
                                console.error("Unknown entity: ", within);
                        }
                    }
                }
            }
            catch (e) {
                console.error("Error in adminAreadSpider: ", e);
                triggerErrorQueueEevent(collections, within, e as string);
            }
        } else {
            console.log("No entities to process");
        }
    }
}

async function fetchEntityRecords(collections: string[], within: string) {
    
    const query : string = getSPARQL(collections, within);
    try{
        interface SPARQLResponse {
            link: string;
            code: string;
            name: string;
            status: string;
        }
        const response = await fetch(`https://statistics.data.gov.uk/sparql.json?query=${encodeURIComponent(query)}`, {
            headers: {
                Accept: 'application/json'
            },
            method: 'GET',
        });
        // Get the actual data from the response
        
        const data: SPARQLResponse[] =  await response.json() as SPARQLResponse[];

        // map response to AdminAreaType
        const adminAreas: AdminAreaType[] = data.map((record: SPARQLResponse) => {
            return {
                code: record.code,
                name: record.name,
                parentCode: within,
                lastChanged: new Date(),
                isActive: true,
                type: getAdminAreaType(record.code)
            }
        });

        // write the records to the database
        for (let adminArea of adminAreas) {
            await AdminArea.createUpdate(adminArea);
            if (adminArea.type !== AdminArea_Type.LSOA_01) {
                // Trigger a queueEntity to fetch the children
                triggerQueueEntityEvent(collections, adminArea.code, false)
            }
        }
        // add lasItem flag to the queueEntity event
        triggerQueueEntityEvent(collections, within, true)

    } catch(e) {
        console.log('error', e);
        triggerErrorQueueEevent(collections, within, e as string);
    }    
}

// create the sparql query for the collections and within code
function getSPARQL(collections: string[], within: string) {
    
    const collectionString = collections.map(entity => 
        `<http://statistics.data.gov.uk/id/statistical-entity/${entity}>`).join('\n');
    
    const query = `SELECT ?link ?code ?name ?status 
        WHERE { 
            VALUES ?entityCode {
                ${collectionString}
            } 
        ?link <http://statistics.data.gov.uk/def/statistical-entity#code> ?entityCode ;
            <http://www.w3.org/2004/02/skos/core#notation> ?code .
        ?link <http://publishmydata.com/def/ontology/foi/displayName>  ?name .
        ?link <http://statistics.data.gov.uk/def/statistical-geography#status> ?status
        FILTER (?status = "live")
        }
        ORDER BY ASC(?code)`
    return query;
}

// sends the entity to the queue ready to be processed
async function triggerQueueEntityEvent(collections:string[], within: string, lastItem: boolean) {
     
    const childEvent = {
        EventBusName: Fn.importValue("EventBusName"),
        Source: "eventEntityFetchQueue",
        DetailType: "Queueu Fetch Children Within",
        Detail: JSON.stringify({ collections: collections, within: within, lastItem: lastItem }),
    };
    await eventBridge.putEvents({ Entries: [childEvent] }).promise();
}

async function triggerErrorQueueEevent(collections: string[], within: string, error: string) {
         
        const childEvent = {
            EventBusName: Fn.importValue("EventBusName"),
            Source: "eventErrorQueue",
            DetailType: "Queueu Fetch Children Within",
            Detail: JSON.stringify({ collections: collections, within: within, error: error }),
        };
        await eventBridge.putEvents({ Entries: [childEvent] }).promise();
}

async function triggerQueueEntityComplete(within: string) {
         
    const childEvent = {
        EventBusName: Fn.importValue("EventBusName"),
        Source: "queueComplete",
        DetailType: "entityFetch-Complete",
        Detail: JSON.stringify({ within: within, lastItem: true }),
    };
    await eventBridge.putEvents({ Entries: [childEvent] }).promise();
}

function getAdminAreaType(code: string): AdminAreaTypeType {
    switch (code.substring(1, 2)) {
        case "01":
            return AdminArea_Type.LSOA_01;
        case "06":
            return AdminArea_Type.UNITARY_AUTHORITY_06;
        case "07":
            return AdminArea_Type.NON_MET_DISTR_07;
        case "08":
            return AdminArea_Type.MET_DISTR_08;
        case "09":
            return AdminArea_Type.LONDON_BOROUH_09;
        case "10":
            return AdminArea_Type.COUNTY_10;
        case "11":
            return AdminArea_Type.MET_COUNTY_11;
        case "12":
            return AdminArea_Type.REGION_12;    
        case "92":
            return AdminArea_Type.COUNTRY_92;
        default:
            return AdminArea_Type.NOT_KNOWN;
    }
}