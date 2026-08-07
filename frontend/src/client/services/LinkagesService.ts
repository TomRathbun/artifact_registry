/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LinkageCreate } from '../models/LinkageCreate';
import type { LinkageOut } from '../models/LinkageOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LinkagesService {
    /**
     * List Linkages
     * @param projectId
     * @returns LinkageOut Successful Response
     * @throws ApiError
     */
    public static listLinkagesApiV1LinkagesGet(
        projectId?: (string | null),
    ): CancelablePromise<Array<LinkageOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/linkages/',
            query: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Linkages
     * @param projectId
     * @returns LinkageOut Successful Response
     * @throws ApiError
     */
    public static listLinkagesApiV1LinkagesGet1(
        projectId?: (string | null),
    ): CancelablePromise<Array<LinkageOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/linkages/',
            query: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Linkage
     * @param requestBody
     * @returns LinkageOut Successful Response
     * @throws ApiError
     */
    public static createLinkageApiV1LinkagesPost(
        requestBody: LinkageCreate,
    ): CancelablePromise<LinkageOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/linkages/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Linkage
     * @param requestBody
     * @returns LinkageOut Successful Response
     * @throws ApiError
     */
    public static createLinkageApiV1LinkagesPost1(
        requestBody: LinkageCreate,
    ): CancelablePromise<LinkageOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/linkages/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Linkage
     * @param aid
     * @returns LinkageOut Successful Response
     * @throws ApiError
     */
    public static getLinkageApiV1LinkagesAidGet(
        aid: string,
    ): CancelablePromise<LinkageOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/linkages/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Linkage
     * @param aid
     * @returns LinkageOut Successful Response
     * @throws ApiError
     */
    public static getLinkageApiV1LinkagesAidGet1(
        aid: string,
    ): CancelablePromise<LinkageOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/linkages/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Linkage
     * @param aid
     * @param requestBody
     * @returns LinkageOut Successful Response
     * @throws ApiError
     */
    public static updateLinkageApiV1LinkagesAidPut(
        aid: string,
        requestBody: LinkageCreate,
    ): CancelablePromise<LinkageOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/linkages/{aid}',
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
     * Update Linkage
     * @param aid
     * @param requestBody
     * @returns LinkageOut Successful Response
     * @throws ApiError
     */
    public static updateLinkageApiV1LinkagesAidPut1(
        aid: string,
        requestBody: LinkageCreate,
    ): CancelablePromise<LinkageOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/linkages/{aid}',
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
     * Delete Linkage
     * @param aid
     * @returns void
     * @throws ApiError
     */
    public static deleteLinkageApiV1LinkagesAidDelete(
        aid: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/linkages/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Linkage
     * @param aid
     * @returns void
     * @throws ApiError
     */
    public static deleteLinkageApiV1LinkagesAidDelete1(
        aid: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/linkages/{aid}',
            path: {
                'aid': aid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Outgoing Linkages
     * @param sourceAid
     * @returns LinkageOut Successful Response
     * @throws ApiError
     */
    public static getOutgoingLinkagesApiV1LinkagesFromSourceAidGet(
        sourceAid: string,
    ): CancelablePromise<Array<LinkageOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/linkages/from/{source_aid}',
            path: {
                'source_aid': sourceAid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Outgoing Linkages
     * @param sourceAid
     * @returns LinkageOut Successful Response
     * @throws ApiError
     */
    public static getOutgoingLinkagesApiV1LinkagesFromSourceAidGet1(
        sourceAid: string,
    ): CancelablePromise<Array<LinkageOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/linkages/from/{source_aid}',
            path: {
                'source_aid': sourceAid,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
