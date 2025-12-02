/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EarsType } from './EarsType';
import type { ReqLevel } from './ReqLevel';
export type RequirementCreate = {
    short_name: string;
    text: string;
    area?: (string | null);
    level?: (ReqLevel | null);
    ears_type?: (EarsType | null);
    status?: (string | null);
    rationale?: (string | null);
    owner?: (string | null);
    project_id: string;
    source_use_case_id: string;
};

