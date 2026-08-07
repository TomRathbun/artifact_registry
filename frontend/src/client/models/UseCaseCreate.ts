/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExceptionBase } from './ExceptionBase';
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
    precondition_ids?: Array<string>;
    postcondition_ids?: Array<string>;
    exceptions?: Array<ExceptionBase>;
    mss?: Array<MssStep>;
    extensions?: Array<ExtensionStep>;
    project_id: string;
};

