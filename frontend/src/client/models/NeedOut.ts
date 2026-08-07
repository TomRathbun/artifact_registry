/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ComponentOut } from './ComponentOut';
import type { NeedLevel } from './NeedLevel';
import type { SiteOut } from './SiteOut';
export type NeedOut = {
    aid: string;
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
    source_vision_id?: (string | null);
    created_date?: (string | null);
    last_updated?: (string | null);
    level?: (NeedLevel | null);
    sites?: Array<SiteOut>;
    components?: Array<ComponentOut>;
};

