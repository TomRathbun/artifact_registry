/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExtensionStep } from './ExtensionStep';
import type { MssStep } from './MssStep';
export type UseCaseCreate = {
    title: string;
    description?: (string | null);
    trigger?: (string | null);
    primary_actor_id?: (string | null);
    stakeholder_ids?: Array<string>;
    area?: (string | null);
    status?: (string | null);
    scope?: (string | null);
    level?: (string | null);
    precondition_ids?: Array<string>;
    postcondition_ids?: Array<string>;
    exception_ids?: Array<string>;
    mss?: Array<MssStep>;
    extensions?: Array<ExtensionStep>;
    req_references?: Array<string>;
    project_id: string;
    source_need_id: string;
};

