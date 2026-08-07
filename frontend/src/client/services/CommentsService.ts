/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Comment } from '../models/Comment';
import type { CommentCreate } from '../models/CommentCreate';
import type { CommentResolve } from '../models/CommentResolve';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CommentsService {
    /**
     * List Comments
     * List all comments for an artifact.
     * Optionally filter by resolved status.
     * @param artifactAid Artifact AID to get comments for
     * @param resolved Filter by resolution status
     * @returns Comment Successful Response
     * @throws ApiError
     */
    public static listCommentsApiV1CommentsGet(
        artifactAid: string,
        resolved?: (boolean | null),
    ): CancelablePromise<Array<Comment>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/comments/',
            query: {
                'artifact_aid': artifactAid,
                'resolved': resolved,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Comment
     * Create a new comment on an artifact field.
     * @param requestBody
     * @returns Comment Successful Response
     * @throws ApiError
     */
    public static createCommentApiV1CommentsPost(
        requestBody: CommentCreate,
    ): CancelablePromise<Comment> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/comments/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Resolve Comment
     * Mark a comment as resolved.
     * @param commentId
     * @param requestBody
     * @returns Comment Successful Response
     * @throws ApiError
     */
    public static resolveCommentApiV1CommentsCommentIdResolvePatch(
        commentId: string,
        requestBody: CommentResolve,
    ): CancelablePromise<Comment> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/comments/{comment_id}/resolve',
            path: {
                'comment_id': commentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Unresolve Comment
     * Mark a comment as unresolved (reopen it).
     * @param commentId
     * @returns Comment Successful Response
     * @throws ApiError
     */
    public static unresolveCommentApiV1CommentsCommentIdUnresolvePatch(
        commentId: string,
    ): CancelablePromise<Comment> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/comments/{comment_id}/unresolve',
            path: {
                'comment_id': commentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Comment
     * Delete a comment.
     * @param commentId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteCommentApiV1CommentsCommentIdDelete(
        commentId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/comments/{comment_id}',
            path: {
                'comment_id': commentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
