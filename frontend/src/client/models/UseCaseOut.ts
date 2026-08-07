/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActorOut } from './ActorOut';
import type { ExceptionBase } from './ExceptionBase';
import type { ExtensionStep } from './ExtensionStep';
import type { MssStep } from './MssStep';
import type { PersonOut } from './PersonOut';
import type { PostconditionOut } from './PostconditionOut';
import type { PreconditionOut } from './PreconditionOut';
export type UseCaseOut = {
    aid: string;
    title: string;
    description?: (string | null);
    trigger?: (string | null);
    primary_actor?: (ActorOut | null);
    stakeholders?: Array<PersonOut>;
    area?: (string | null);
    status?: (string | null);
    preconditions?: Array<PreconditionOut>;
    postconditions?: Array<PostconditionOut>;
    exceptions?: Array<ExceptionBase>;
    mss?: Array<MssStep>;
    extensions?: Array<ExtensionStep>;
    project_id: string;
    created_date?: (string | null);
    last_updated?: (string | null);
    source_need_id?: (string | null);
};

