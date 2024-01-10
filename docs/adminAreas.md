# Admin Areas

Regions may Contain:
County, LB, MD, UA

County contains:
NMD

LB, MD, NMD, UA all contain LSOA

## England (E92)x1

```bash
SELECT ?lsoa ?code ?name
WHERE {
	?lsoa <http://statistics.data.gov.uk/def/statistical-entity#code> 	
	<http://statistics.data.gov.uk/id/statistical-entity/E92>;
	<http://www.w3.org/2004/02/skos/core#notation> ?code .
  OPTIONAL {
        ?lsoa <http://publishmydata.com/def/ontology/foi/displayName>  ?name . 
  }
}
LIMIT 1
```

## Regions (E12) x9

### List of Regions

```bash
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
LIMIT 10
```

## Counties (E10) x21 1-21  

List NMD in a County

## London Boroughs (E09) x33 1-33  

List LSOA in a LB

## Met Districts (E08) x36

List LSOA in a MD

## Non Met Districts (E07) x164

List LSOA in an NMD

## Unitary Authorities (E06) x63

List LSOA in a UA

## LSOA (E01) x33755