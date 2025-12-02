/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ArtifactEventOut } from '../models/ArtifactEventOut';
import type { StatusTransition } from '../models/StatusTransition';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ArtifactEventsService {

    /**
     * Transition Artifact
     * @param artifactType 
     * @param artifactId 
     * @param requestBody 
     * @returns ArtifactEventOut Successful Response
     * @throws ApiError
     */
    public static transitionArtifactApiV1EventsArtifactTypeArtifactIdTransitionPost(
        artifactType: string,
        artifactId: string,
        requestBody: StatusTransition,
    ): CancelablePromise<ArtifactEventOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/events/{artifact_type}/{artifact_id}/transition',
            path: {
                'artifact_type': artifactType,
                'artifact_id': artifactId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Artifact History
     * @param artifactType 
     * @param artifactId 
     * @returns ArtifactEventOut Successful Response
     * @throws ApiError
     */
    public static getArtifactHistoryApiV1EventsArtifactTypeArtifactIdHistoryGet(
        artifactType: string,
        artifactId: string,
    ): CancelablePromise<Array<ArtifactEventOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/events/{artifact_type}/{artifact_id}/history',
            path: {
                'artifact_type': artifactType,
                'artifact_id': artifactId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
