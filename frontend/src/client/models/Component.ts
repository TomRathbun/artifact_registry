/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Component = {
    id: string;
    name: string;
    type: string;
    children?: Array<{
        child_id: string;
        child_name: string;
        child_type: string;
        cardinality?: string;
    }>;
};

export type ComponentCreate = {
    name: string;
    type: string;
    parent_ids?: Array<string>;
};

export type ComponentUpdate = {
    name?: string | null;
    type?: string | null;
    parent_ids?: Array<string> | null;
};
