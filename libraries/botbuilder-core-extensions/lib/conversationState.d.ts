/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotContext } from 'botbuilder-core';
import { BotState } from './botState';
import { Storage, StoreItem } from './storage';
export declare class ConversationState<T extends StoreItem = StoreItem> extends BotState<T> {
    /**
     * Creates a new ConversationState instance.
     * @param storage Storage provider to persist conversation state to.
     * @param cacheKey (Optional) name of the cached entry on the context object. A property accessor with this name will also be added to the context object. The default value is 'conversationState'.
     */
    constructor(storage: Storage, cacheKey?: string);
    /**
     * Returns the storage key for the current conversation state.
     * @param context Context for current turn of conversation with the user.
     */
    getStorageKey(context: BotContext): string | undefined;
    private extendContext(context);
}
