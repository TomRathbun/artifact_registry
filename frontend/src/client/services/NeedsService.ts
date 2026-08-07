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
     * @param status Filter by status (e.g., Draft)
     * @param owner Filter by owner
     * @param search Keyword search in title/description
     * @param selectAll Ignore filters and return all
     * @returns NeedOut Successful Response
     * @throws ApiError
     */
    public static listNeedsApiV1NeedsGet(
        projectId?: (string | null),
        area?: (Array<string> | null),
        status?: (Array<string> | null),
        owner?: (string | null),
        search?: (string | null),
        selectAll: boolean = false,
    ): CancelablePromise<Array<NeedOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/needs/',
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
     * @param projectId Filter by project ID
     * @param area Filter by area (e.g., MCK)
     * @param status Filter by status (e.g., Draft)
     * @param owner Filter by owner
     * @param search Keyword search in title/description
     * @param selectAll Ignore filters and return all
     * @returns NeedOut Successful Response
     * @throws ApiError
     */
    public static listNeedsApiV1NeedsGet1(
        projectId?: (string | null),
        area?: (Array<string> | null),
        status?: (Array<string> | null),
        owner?: (string | null),
        search?: (string | null),
        selectAll: boolean = false,
    ): CancelablePromise<Array<NeedOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/needs/',
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
     * Create Need
     * @param requestBody
     * @returns NeedOut Successful Response
     * @throws ApiError
     */
    public static createNeedApiV1NeedsPost(
        requestBody: NeedCreate,
    ): CancelablePromise<NeedOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/needs/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Need
     * @param requestBody
     * @returns NeedOut Successful Response
     * @throws ApiError
     */
    public static createNeedApiV1NeedsPost1(
        requestBody: NeedCreate,
    ): CancelablePromise<NeedOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/needs/',
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
    public static getNeedApiV1NeedsAidGet(
        aid: string,
    ): CancelablePromise<NeedOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/needs/{aid}',
            path: {
                'aid': aid,
            },
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
    public static getNeedApiV1NeedsAidGet1(
        aid: string,
    ): CancelablePromise<NeedOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/needs/{aid}',
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
    public static updateNeedApiV1NeedsAidPut(
        aid: string,
        requestBody: NeedCreate,
    ): CancelablePromise<NeedOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/needs/{aid}',
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
     * Update Need
     * @param aid
     * @param requestBody
     * @returns NeedOut Successful Response
     * @throws ApiError
     */
    public static updateNeedApiV1NeedsAidPut1(
        aid: string,
        requestBody: NeedCreate,
    ): CancelablePromise<NeedOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/needs/{aid}',
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
    public static deleteNeedApiV1NeedsAidDelete(
        aid: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/needs/{aid}',
            path: {
                'aid': aid,
            },
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
    public static deleteNeedApiV1NeedsAidDelete1(
        aid: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/needs/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
