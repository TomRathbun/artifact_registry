/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NeedLevel } from './NeedLevel';
export type NeedCreate = {
    title: string;
    description: string;
    area?: (string | null);
    status?: (string | null);
    owner?: (string | null);
    rationale?: (string | null);
    stakeholder?: (string | null);
    owner_id?: (string | null);
    stakeholder_id?: (string | null);
    project_id: string;
    level?: (NeedLevel | null);
    site_ids?: (Array<string> | null);
    component_ids?: (Array<string> | null);
};

