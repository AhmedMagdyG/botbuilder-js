/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotContext, Attachment } from 'botbuilder';
import { Dialog } from '../dialog';
import { DialogSet } from '../dialogSet';
import { PromptOptions, PromptValidator, sendPrompt } from './prompt';

/**
 * Prompts a user to upload attachments like images. By default the prompt will return to the 
 * calling dialog a `Attachment[]` but this can be overridden using a custom `PromptValidator`.
 * 
 * **Example usage:**
 * 
 * ```JavaScript
 * const { DialogSet, AttachmentPrompt } = require('botbuilder-dialogs');
 * 
 * const dialogs = new DialogSet();
 * 
 * dialogs.add('attachmentPrompt', new AttachmentPrompt());
 * 
 * dialogs.add('uploadImage', [
 *      function (context) {
 *          return dialogs.prompt(context, 'attachmentPrompt', `Send me image(s)`);
 *      },
 *      function (context, attachments) {
 *          context.reply(`Processing ${attachments.length} images.`);
 *          return dialogs.end(context);
 *      }
 * ]);
 * ```
 */
export class AttachmentPrompt<C extends BotContext> implements Dialog<C> {
    /**
     * Creates a new instance of the prompt.
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * dialogs.add('imagePrompt', new AttachmentPrompt((context, values) => {
     *      if (values.length < 1) {
     *          context.reply(`Send me an image or say 'cancel'.`);
     *          return Prompts.resolve();
     *      } else {
     *          return dialogs.end(context, values);
     *      }
     * }));
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt.
     */
    constructor(private validator?: PromptValidator<C, Attachment[]>) {}

    public begin(context: C, dialogs: DialogSet<C>, options: PromptOptions): Promise<void> {
        // Persist options
        const instance = dialogs.getInstance<PromptOptions>(context);
        instance.state = options || {};

        // Send initial prompt
        if (instance.state.prompt) { 
            return sendPrompt(context, instance.state.prompt, instance.state.speak); 
        }
        return Promise.resolve();
    }

    public continue(context: C, dialogs: DialogSet<C>): Promise<void> {
        // Recognize value
        const options = dialogs.getInstance<PromptOptions>(context).state;
        const values: Attachment[] = context.request && context.request.attachments ? context.request.attachments : [];
        if (this.validator) {
            // Call validator for further processing
            return Promise.resolve(this.validator(context, values, dialogs));
        } else if (values.length > 0) {
            // Return recognized values
            return dialogs.end(context, values);
        } else {
            if (options.retryPrompt) {
                // Send retry prompt to user
                return sendPrompt(context, options.retryPrompt, options.retrySpeak);
            } else if (options.prompt) {
                // Send original prompt to user
                return sendPrompt(context, options.prompt, options.speak);
            }
            return Promise.resolve();
        }
    }
}
