/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ResourceResponse, ConversationReference } from 'botframework-schema';
import { BotAdapter } from './botAdapter';
import { Promiseable } from './middlewareSet';
export declare type SendActivitiesHandler = (activities: Partial<Activity>[], next: () => Promise<ResourceResponse[]>) => Promiseable<ResourceResponse[]>;
export declare type UpdateActivityHandler = (activity: Partial<Activity>, next: () => Promise<void>) => Promiseable<void>;
export declare type DeleteActivityHandler = (id: string, next: () => Promise<void>) => Promiseable<void>;
export interface TurnContext<A extends BotAdapter> {
}
export declare class TurnContext<A extends BotAdapter = BotAdapter> {
    private _adapter;
    private _request;
    private _responded;
    private _cache;
    private _onSendActivities;
    private _onUpdateActivity;
    private _onDeleteActivity;
    /**
     * Creates a new turn context instance.
     * @param adapter Adapter that constructed the context.
     * @param request Request being processed.
     */
    constructor(adapter: A, request: Partial<Activity>);
    /** The adapter for this context. */
    readonly adapter: A;
    /** The received activity. */
    readonly request: Activity;
    /** If `true` at least one response has been sent for the current turn of conversation. */
    responded: boolean;
    /**
     * Gets a value previously cached on the context.
     * @param T (Optional) type of value being returned.
     * @param key The key to lookup in the cache.
     */
    get<T = any>(key: string): T;
    /**
     * Returns `true` if [set()](#set) has been called for a key. The cached value may be `undefined`.
     * @param key The key to lookup in the cache.
     */
    has(key: string): boolean;
    /**
     * Caches a value for the lifetime of the current turn.
     * @param key The key of the value being cached.
     * @param value The value to cache.
     */
    set(key: string, value: any): this;
    /**
     * Sends a set of activities to the user. An array of responses form the server will be
     * returned.
     * @param activities Set of activities being sent.
     */
    sendActivities(activities: Partial<Activity>[]): Promise<ResourceResponse[]>;
    /**
     * Replaces an existing activity.
     * @param activity New replacement activity. The activity should already have it's ID information populated.
     */
    updateActivity(activity: Partial<Activity>): Promise<void>;
    /**
     * Deletes an existing activity.
     * @param id of the activity to delete.
     */
    deleteActivity(id: string): Promise<void>;
    /**
     * Registers a handler to be notified of and potentially intercept the sending of activities.
     * @param handler A function that will be called anytime [sendActivities()](#sendactivities) is called. The handler should call `next()` to continue sending of the activities.
     */
    onSendActivities(handler: SendActivitiesHandler): this;
    /**
     * Registers a handler to be notified of and potentially intercept an activity being updated.
     * @param handler A function that will be called anytime [updateActivity()](#updateactivity) is called. The handler should call `next()` to continue sending of the replacement activity.
     */
    onUpdateActivity(handler: UpdateActivityHandler): this;
    /**
     * Registers a handler to be notified of and potentially intercept an activity being deleted.
     * @param handler A function that will be called anytime [deleteActivity()](#deleteactivity) is called. The handler should call `next()` to continue deletion of the activity.
     */
    onDeleteActivity(handler: DeleteActivityHandler): this;
    private emit<T>(handlers, arg, next);
    /**
     * Returns the conversation reference for an activity. This can be saved as a plain old JSON
     * object and then later used to message the user proactively.
     *
     * **Usage Example**
     *
     * ```JavaScript
     * const reference = TurnContext.getConversationReference(context.request);
     * ```
     * @param activity The activity to copy the conversation reference from
     */
    static getConversationReference(activity: Partial<Activity>): Partial<ConversationReference>;
    /**
     * Updates an activity with the delivery information from a conversation reference. Calling
     * this after [getConversationReference()](#getconversationreference) on an incoming activity
     * will properly address the reply to a received activity.
     *
     * **Usage Example**
     *
     * ```JavaScript
     * // Send a typing indicator without calling any handlers
     * const reference = TurnContext.getConversationReference(context.request);
     * const activity = TurnContext.applyConversationReference({ type: 'typing' }, reference);
     * return context.adapter.sendActivities([activity]);
     * ```
     * @param activity Activity to copy delivery information to.
     * @param reference Conversation reference containing delivery information.
     */
    static applyConversationReference(activity: Partial<Activity>, reference: Partial<ConversationReference>): Partial<Activity>;
}
