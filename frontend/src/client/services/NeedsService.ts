/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NeedCreate } from '../models/NeedCreate';
import type { NeedOut } from '../models/NeedOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NeedsService {
    /**
     * List Needs
     * @param projectId Filter by project ID
     * @param area Filter by area (e.g., MCK)
     * @param status Filter by status (e.g., proposed)
     * @param owner Filter by owner
     * @param search Search term
     * @param selectAll Ignore filters and return all
     * @returns NeedOut Successful Response
     * @throws ApiError
     */
    public static listNeedsApiV1NeedNeedsGet(
        projectId?: (string | null),
        area?: (Array<string> | null),
        status?: (Array<string> | null),
        owner?: (string | null),
        search?: (string | null),
        selectAll: boolean = false,
    ): CancelablePromise<Array<NeedOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/need/needs/',
            query: {
                'project_id': projectId,
                'area': area,
                'status': status,
                'owner': owner,
                'search': search,
                'select_all': selectAll,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Needs
     * @param area Filter by area (e.g., MCK)
     * @param status Filter by status (e.g., proposed)
     * @param requestBody
     * @returns NeedOut Successful Response
     * @throws ApiError
     */
    public static createNeedApiV1NeedNeedsPost(
        requestBody: NeedCreate,
    ): CancelablePromise<NeedOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/need/needs/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Need
     * @param aid
     * @returns NeedOut Successful Response
     * @throws ApiError
     */
    public static getNeedApiV1NeedNeedsAidGet(
        aid: string,
    ): CancelablePromise<NeedOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/need/needs/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Need
     * @param aid
     * @param requestBody
     * @returns NeedOut Successful Response
     * @throws ApiError
     */
    public static updateNeedApiV1NeedNeedsAidPut(
        aid: string,
        requestBody: NeedCreate,
    ): CancelablePromise<NeedOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/need/needs/{aid}',
            path: {
                'aid': aid,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Need
     * @param aid
     * @returns void
     * @throws ApiError
     */
    public static deleteNeedApiV1NeedNeedsAidDelete(
        aid: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/need/needs/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
