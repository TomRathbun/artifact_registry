/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Site } from '../models/Site';
import type { SiteCreate } from '../models/Site';
import type { SiteUpdate } from '../models/Site';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SiteService {

    /**
     * List Sites
     * @param skip 
     * @param limit 
     * @returns Site Successful Response
     * @throws ApiError
     */
    public static listSitesApiV1SitesGet(
        skip: number = 0,
        limit: number = 100,
    ): CancelablePromise<Array<Site>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/sites/',
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create Site
     * @param requestBody 
     * @returns Site Successful Response
     * @throws ApiError
     */
    public static createSiteApiV1SitesPost(
        requestBody: SiteCreate,
    ): CancelablePromise<Site> {
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
     * Get Site
     * @param siteId 
     * @returns Site Successful Response
     * @throws ApiError
     */
    public static getSiteApiV1SitesSiteIdGet(
        siteId: string,
    ): CancelablePromise<Site> {
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
     * @returns Site Successful Response
     * @throws ApiError
     */
    public static updateSiteApiV1SitesSiteIdPut(
        siteId: string,
        requestBody: SiteUpdate,
    ): CancelablePromise<Site> {
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
