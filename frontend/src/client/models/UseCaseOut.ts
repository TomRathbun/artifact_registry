/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActorOut } from './ActorOut';
import type { ExceptionOut } from './ExceptionOut';
import type { ExtensionStep } from './ExtensionStep';
import type { MssStep } from './MssStep';
import type { PostconditionOut } from './PostconditionOut';
import type { PreconditionOut } from './PreconditionOut';
export type UseCaseOut = {
    aid: string;
    title: string;
    description?: (string | null);
    trigger?: (string | null);
    primary_actor?: (ActorOut | null);
    stakeholders?: Array<ActorOut>;
    area?: (string | null);
    status?: (string | null);
    scope?: (string | null);
    level?: (string | null);
    preconditions?: Array<PreconditionOut>;
    postconditions?: Array<PostconditionOut>;
    exceptions?: Array<ExceptionOut>;
    mss?: Array<MssStep>;
    extensions?: Array<ExtensionStep>;
    req_references?: Array<string>;
    project_id: string;
    created_date?: (string | null);
    last_updated?: (string | null);
};

