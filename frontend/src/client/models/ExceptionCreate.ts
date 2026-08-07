/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MssStep } from './MssStep';
export type ExceptionCreate = {
    trigger: string;
    handling: string;
    steps?: (Array<MssStep> | null);
    project_id: string;
};

