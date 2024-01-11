/**
 * AdminArea type
 * 
 * @type
 */

export type AdminAreaType = {
    code: string;
    name: string;
    parentCode: string;
    lastChanged: Date;
    isActive: boolean;
    type: AdminAreaTypeType;
    lat?: number;
    lng?: number;
  };

  export enum AdminAreaTypeType {
    LSOA_01 = 'LSOA',
    UNITARY_AUTHORITY_06 = 'UA',
    NON_MET_DISTR_07 = 'NMD',
    MET_DISTR_08 = 'MD',
    LONDON_BOROUH_09 = 'LB',
    COUNTY_10 = 'CTY',
    MET_COUNTY_11 = 'MCTY',
    REGION_12 = 'RGN',
    COUNTRY_92 = 'CTRY',
    NOT_KNOWN = 'NK'
}

