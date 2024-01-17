<script lang='ts'>
	import { Table, TableBodyRow, TableHeadCell, TableHead, TableBodyCell, TableBody } from 'flowbite-svelte';
	import { AdminAreaTypeType as AdminArea_Type, type AdminAreaType, type AdminAreaTypeType } from '@pwa-grouper/core/types/adminArea';

    let adminAreas: AdminAreaType[] = [];

    async function fetchEntityRecords(collections: string[], within: string) {
        
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
            
            const data: SPARQLResponse[] =  await response.json() as SPARQLResponse[];

            // map response to AdminAreaType
            adminAreas = data.map((record: SPARQLResponse) => {
                return {
                    code: record.code,
                    name: record.name,
                    parentCode: within,
                    lastChanged: new Date(),
                    isActive: true,
                    type: getAdminAreaType(record.code)
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

</script>

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
            <TableBodyRow colspan="3">No admin areas found</TableBodyRow>
        {/if}
    </TableBody>
</Table>