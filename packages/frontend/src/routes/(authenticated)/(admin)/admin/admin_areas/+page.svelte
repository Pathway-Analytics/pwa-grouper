<script lang='ts'>
	import { page } from '$app/stores';
    import { onMount } from 'svelte';
	import { Table, Button, TableBodyRow, TableHeadCell, TableHead, TableBodyCell, TableBody } from 'flowbite-svelte';
	import { AdminAreaTypeType as AdminArea_Type, type AdminAreaType, type AdminAreaTypeType } from '@pwa-grouper/core/types/adminArea';

    let query: string = '';
    let p: number = 1;
    let pageSize: number = 1000;
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
        link: typeValue;
        code: typeValue;
        name: typeValue;
        status: typeValue;
        within: typeValue;
    }

    interface JsonResponseObject {
        head: {
            vars: string[];
        };
        results: {
            bindings: bindings[];
        };
    }

    async function fetchEntityRecords(collection: string, within: string, pageNumber: number = 1) {
        p = pageNumber;
        // convert the csv collections string to an array of strings
        collections = collection.split(',');
        
        query = getSPARQL(collections, within, p, pageSize);
        try {

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
                    parentCode: resultsRecord.within.value,
                    lastChanged: new Date(),
                    isActive: resultsRecord.status.value.toLowerCase() === 'live',
                    type: getAdminAreaType(resultsRecord.code.value.substring(0, 3)),
                }
            });

        } catch(e) {
            // add lasItem flag to the queueEntity event
        
            console.log('error', e);
            
        }    
    }


    function getSPARQL(collections: string[], within: string, pageNumber: number = 1, pageSize?: number) {
    
        const collectionString = collections.map(entity => 
            `<http://statistics.data.gov.uk/id/statistical-entity/${entity}>`).join('\n');
        
        const paginationString = pageSize ? `LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize}` : '';
        const withinString = within ? `VALUES ?withinLink { <http://statistics.data.gov.uk/id/statistical-geography/${within}> }` : '';

        const query = `SELECT ?link ?code ?name ?status ?within
            WHERE { 
                VALUES ?entityCode {${collectionString}}
                ${withinString}
            ?link <http://statistics.data.gov.uk/def/statistical-entity#code> ?entityCode ;
            <http://www.w3.org/2004/02/skos/core#notation> ?code .
            ?link <http://publishmydata.com/def/ontology/foi/displayName>  ?name .
            ?link <http://statistics.data.gov.uk/def/statistical-geography#status> ?status .
            ?link <http://publishmydata.com/def/ontology/foi/within> ?withinLink .
            ?withinLink <http://www.w3.org/2004/02/skos/core#notation> ?within
            }
            ORDER BY ASC(?code)
            ${paginationString}
            `

            
        return query;
    }

// SELECT ?link ?code ?name ?status ?within
// WHERE { 
  
//   #VALUES ?item {'?'} #'E01034292'}
//    VALUES ?within {'E07000213'}
//     VALUES ?entityCode { <http://statistics.data.gov.uk/id/statistical-entity/E01> }
//     #VALUES ?withinLink { <http://statistics.data.gov.uk/id/statistical-geography/E07000213> }
//     ?link <http://statistics.data.gov.uk/def/statistical-entity#code> ?entityCode ;
//          <http://www.w3.org/2004/02/skos/core#notation> ?item .
//     ?link <http://publishmydata.com/def/ontology/foi/displayName>  ?name .
//     ?link <http://statistics.data.gov.uk/def/statistical-geography#status> ?status .
//     ?link <http://publishmydata.com/def/ontology/foi/within> ?withinLink .
//   ?withinLink <http://www.w3.org/2004/02/skos/core#notation> ?within

//     FILTER (?status = "live")
// }
// ORDER BY ASC(?code)
// LIMIT 10 
// #?pageSize 
// #OFFSET =(?pageNumber - 1) * ?pageSize

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
<!-- add pagination buttons and dropdown for pagesize -->
<Button on:click={() => fetchEntityRecords(collection, within, 1)}>First</Button>
<Button on:click={() => fetchEntityRecords(collection, within, p-1)}>Previous</Button>
<Button on:click={() => fetchEntityRecords(collection, within, p+1)}>Next</Button>
<select bind:value={pageSize}>
    <option value='10'>10</option>
    <option value='100'>100</option>
    <option value='1000'>1000</option>
</select>
<!-- display the number of records -->
<p>Number of records: {adminAreas.length}</p>
<div>
<Table>
    <TableHead>
        <TableHeadCell>Code</TableHeadCell>
        <TableHeadCell>Name</TableHeadCell>
        <TableHeadCell>Type</TableHeadCell>
        <TableHeadCell>Status</TableHeadCell>
        <TableHeadCell>Within</TableHeadCell>
    </TableHead>

    <TableBody>
        {#if adminAreas.length > 0}
            {#each adminAreas as adminArea}
                <TableBodyRow>
                    <TableBodyCell>{adminArea.code}</TableBodyCell>
                    <TableBodyCell>{adminArea.name}</TableBodyCell>
                    <TableBodyCell>{adminArea.type}</TableBodyCell>
                    <TableBodyCell>{adminArea.isActive}</TableBodyCell>
                    <TableBodyCell>{adminArea.parentCode}</TableBodyCell>
                </TableBodyRow>
            {/each}
       {:else}
            <TableBodyRow >
                <TableBodyCell colspan='5'>No admin areas found</TableBodyCell>
            </TableBodyRow>
        {/if}
    </TableBody>
</Table>
{query}
</div>

<style>
    /* vertical scroll */
    div {
        height: 100vh;
        overflow-y: auto;
        margin: 20px;
    }
</style>