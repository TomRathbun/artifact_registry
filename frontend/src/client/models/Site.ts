/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Site = {
    id: string;
    name: string;
    security_domain?: string | null;
};

export type SiteCreate = {
    name: string;
    security_domain?: string | null;
};

export type SiteUpdate = {
    name?: string | null;
    security_domain?: string | null;
};
