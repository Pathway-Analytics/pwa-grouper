// const query = encodeURIComponent(`

// );

async function getList(type:string, within?:string) {
    console.log('getList: ', type, within);
    const withinQuery = within && within.length >= 8
    ? `
    ?link <http://publishmydata.com/def/ontology/foi/within> ?geography .
    ?geography <http://www.w3.org/2004/02/skos/core#notation> ?geographyCode .
    FILTER(regex(str(?geography), "^http://statistics.data.gov.uk/id/statistical-geography/${within}"))
    `
    : '';

    let query =` 
    SELECT ?link ?code ?name ?geographyCode
    WHERE {
        ?link <http://statistics.data.gov.uk/def/statistical-entity#code> 	
        <http://statistics.data.gov.uk/id/statistical-entity/${type}>;
        <http://www.w3.org/2004/02/skos/core#notation> ?code .
        ${withinQuery}        
  OPTIONAL {
            ?link <http://publishmydata.com/def/ontology/foi/displayName>  ?name . 
        }
    }
    order by asc(?code) 
    LiMIT 10000
`;
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

export async function lookUp(type:string, within?:string) {
    return (await getList(type, within)).map((area: any) => ({
        link: area.link? area.link.value : null,
        code: area.code? area.code.value : null,
        name: area.name ? area.name.value : null,
        geography: area.geographyCode? area.geographyCode.value : null,
    }));
}



