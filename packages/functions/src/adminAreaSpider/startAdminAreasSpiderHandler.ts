import { EventBridge } from 'aws-sdk';
import { Fn } from 'aws-cdk-lib';
import { AdminArea } from '@pwa-grouper/core/classes/adminArea';
import { AdminAreaType, AdminAreaTypeType as AdminArea_Type, type AdminAreaTypeType } from '@pwa-grouper/core/types/adminArea';

const eventBridge = new EventBridge();

export async function main(within: string) {
         
    const childEvent = {
        EventBusName: Fn.importValue("EventBusName"),
        Source: "fetchChildren",
        DetailType: "Start Admin Area Spider",
        Detail: JSON.stringify({ collectins:["E92"],within: "E92000001", lastItem: false }),
    };
    await eventBridge.putEvents({ Entries: [childEvent] }).promise();
}