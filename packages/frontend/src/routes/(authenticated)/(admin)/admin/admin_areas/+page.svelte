<script lang='ts'>
    import { onMount } from 'svelte';
	import { Table, Button, TableBodyRow, TableHeadCell, TableHead, TableBodyCell, TableBody } from 'flowbite-svelte';
	import { AdminAreaTypeType as AdminArea_Type, type AdminAreaType, type AdminAreaTypeType } from '@pwa-grouper/core/types/adminArea';

    let collection: string = 'E92';
    let within: string = 'E92000001';
    let adminAreas: AdminAreaType[] = [];
    let responseString:string = '';
    let responseData: JsonResponseObject;
    
    let resultsRecords: bindings[];
    let collections: typeof collection[] = [collection]

    onMount(async () => {
        await fetchEntityRecords(collection, within);
    });

    interface areaRecord {
        code: string;
        name: string;
        parentCode: string;
        lastChanged: Date;
        isActive: boolean;
        type: AdminAreaTypeType;
    }
    interface typeValue {
        type: string;
        value: string;
    }

    interface bindings {
        code: typeValue;
        link: typeValue;
        name: typeValue;
        status: typeValue;
    }

    interface JsonResponseObject {
        head: {
            vars: string[];
        };
        results: {
            bindings: bindings[];
        };
    }

    async function fetchEntityRecords(collection: string, within: string) {
        
        // convert the csv collections string to an array of strings
        collections = collection.split(',');
        
        const query : string = getSPARQL(collections, within);
        try {
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
            
            responseData =  await response.json() as JsonResponseObject;
            const data: JsonResponseObject = responseData
            responseString = JSON.stringify(data);
            // set resultsrecords to the results array in the response
            resultsRecords = responseData.results.bindings;
            // map the resultsRecords to the areaRecord interface
            adminAreas = resultsRecords.map((resultsRecord) => {
                return {
                    code: resultsRecord.code.value,
                    name: resultsRecord.name.value,
                    parentCode: within,
                    lastChanged: new Date(),
                    isActive: true,
                    type: getAdminAreaType(resultsRecord.code.value.substring(0, 3)),
                }
            });

        } catch(e) {
            // add lasItem flag to the queueEntity event
        
            console.log('error', e);
            
        }    
    }


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

    function getAdminAreaType(code: string): AdminAreaTypeType {

        switch (code.substring(1)) {
            
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

</script>
<!-- button to refetch the data with the async function fetchEntityRecords -->
<Button on:click={() => fetchEntityRecords(collection, within)}>Fetch</Button>
<!-- add two input fields for collections and within -->
<input bind:value={collection} />
<input bind:value={within} />
<div>
<Table>
    <TableHead>
        <TableHeadCell>Code</TableHeadCell>
        <TableHeadCell>Name</TableHeadCell>
        <TableHeadCell>Type</TableHeadCell>
    </TableHead>

    <TableBody>
        {#if adminAreas.length > 0}
            {#each adminAreas as adminArea}
                <TableBodyRow>
                    <TableBodyCell>{adminArea.code}</TableBodyCell>
                    <TableBodyCell>{adminArea.name}</TableBodyCell>
                    <TableBodyCell>{adminArea.type}</TableBodyCell>
                </TableBodyRow>
            {/each}
       {:else}
            <TableBodyRow >
                <TableBodyCell colspan='3'>No admin areas found</TableBodyCell>
            </TableBodyRow>
        {/if}
    </TableBody>
</Table>
</div>

<style>
    /* vertical scroll */
    div {
        height: 100vh;
        overflow-y: auto;
        margin: 20px;
    }
</style>