/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SiteCreate } from '../models/SiteCreate';
import type { SiteOut } from '../models/SiteOut';
import type { SiteUpdate } from '../models/SiteUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SitesService {
    /**
     * Create Site
     * @param requestBody
     * @returns SiteOut Successful Response
     * @throws ApiError
     */
    public static createSiteApiV1SitesPost(
        requestBody: SiteCreate,
    ): CancelablePromise<SiteOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/sites/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read Sites
     * @param skip
     * @param limit
     * @param projectId
     * @returns SiteOut Successful Response
     * @throws ApiError
     */
    public static readSitesApiV1SitesGet(
        skip?: number,
        limit: number = 100,
        projectId?: string,
    ): CancelablePromise<Array<SiteOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/sites/',
            query: {
                'skip': skip,
                'limit': limit,
                'project_id': projectId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read Site
     * @param siteId
     * @returns SiteOut Successful Response
     * @throws ApiError
     */
    public static readSiteApiV1SitesSiteIdGet(
        siteId: string,
    ): CancelablePromise<SiteOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/sites/{site_id}',
            path: {
                'site_id': siteId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Site
     * @param siteId
     * @param requestBody
     * @returns SiteOut Successful Response
     * @throws ApiError
     */
    public static updateSiteApiV1SitesSiteIdPut(
        siteId: string,
        requestBody: SiteUpdate,
    ): CancelablePromise<SiteOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/sites/{site_id}',
            path: {
                'site_id': siteId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Site
     * @param siteId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteSiteApiV1SitesSiteIdDelete(
        siteId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/sites/{site_id}',
            path: {
                'site_id': siteId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
