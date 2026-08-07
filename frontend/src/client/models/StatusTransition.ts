/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Status } from './Status';
export type StatusTransition = {
    from_status: Status;
    to_status: Status;
    rationale: string;
    comment?: (string | null);
};

