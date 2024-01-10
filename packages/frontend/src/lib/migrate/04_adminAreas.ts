// const query = encodeURIComponent(`
const query =` 
    SELECT ?lsoa ?code ?name
    WHERE {
        ?lsoa <http://statistics.data.gov.uk/def/statistical-entity#code> 	
        <http://statistics.data.gov.uk/id/statistical-entity/E12>;
        <http://www.w3.org/2004/02/skos/core#notation> ?code .
        OPTIONAL {
            ?lsoa <http://publishmydata.com/def/ontology/foi/displayName>  ?name . 
        }
    }
    order by asc(?code) 
`;
// );

async function getList() {
    try{
        const response = await fetch(`https://statistics.data.gov.uk/sparql.json?query=${encodeURIComponent(query)}`, {
            headers: {
                Accept: 'application/json'
            },
            method: 'GET',
            // mode: 'no-cors',
            // body: JSON.stringify({ query: query }) // Convert the query to a JSON string
        });
    
        return JSON.parse(await response.text()).results.bindings;

    } catch(e) {
        console.log('error', e);
        return [];
    }
}

async function getAdminAreas() {
    return (await getList()).map((area: any) => ({
        id: area.lsoa.value,
        code: area.code.value,
        name: area.name ? area.name.value : null
    }));
}

export async function up() {
    const adminAreas = await getAdminAreas();

    console.log('adminAreas', adminAreas);
}