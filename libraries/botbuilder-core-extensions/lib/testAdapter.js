"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_core_1 = require("botbuilder-core");
const assert = require("assert");
/**
 * Test adapter used for unit tests.
 */
class TestAdapter extends botbuilder_core_1.BotAdapter {
    /**
     * Creates a new instance of the test adapter.
     * @param botLogic The bots logic that's under test.
     * @param template (Optional) activity containing default values to assign to all test messages received.
     */
    constructor(botLogic, template) {
        super();
        this.botLogic = botLogic;
        this.nextId = 0;
        /** INTERNAL: used to drive the promise chain forward when running tests. */
        this.activityBuffer = [];
        this.updatedActivities = [];
        this.deletedActivities = [];
        this.template = Object.assign({
            channelId: 'test',
            serviceUrl: 'https://test.com',
            from: { id: 'user', name: 'User1' },
            recipient: { id: 'bot', name: 'Bot' },
            conversation: { id: 'Convo1' }
        }, template);
    }
    sendActivities(activities) {
        const responses = activities.map((activity) => {
            this.activityBuffer.push(activity);
            return { id: (this.nextId++).toString() };
        });
        return Promise.resolve(responses);
    }
    updateActivity(activity) {
        this.updatedActivities.push(activity);
        return Promise.resolve();
    }
    deleteActivity(id) {
        this.deletedActivities.push(id);
        return Promise.resolve();
    }
    /**
     * Processes and activity received from the user.
     * @param activity Text or activity from user.
     */
    receiveActivity(activity) {
        // Initialize request
        const request = Object.assign({}, this.template, typeof activity === 'string' ? { type: botbuilder_core_1.ActivityTypes.Message, text: activity } : activity);
        if (!request.type) {
            request.type = botbuilder_core_1.ActivityTypes.Message;
        }
        if (!request.id) {
            request.id = (this.nextId++).toString();
        }
        // Create context object and run middleware
        const context = new botbuilder_core_1.BotContext(this, request);
        return this.runMiddleware(context, this.botLogic);
    }
    /**
     * Send something to the bot
     * @param userSays text or activity simulating user input
     */
    send(userSays) {
        return new TestFlow(this.receiveActivity(userSays), this);
    }
    /**
     * wait for time period to pass before continuing
     * @param ms ms to wait for
     */
    delay(ms) {
        return new TestFlow(new Promise((resolve, reject) => { setTimeout(() => resolve(), ms); }), this);
    }
    /**
     * Send something to the bot and expect the bot to reply
     * @param userSays text or activity simulating user input
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    test(userSays, expected, description, timeout) {
        return this.send(userSays)
            .assertReply(expected, description);
    }
    /**
     * Throws if the bot's response doesn't match the expected text/activity
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    assertReply(expected, description, timeout) {
        return new TestFlow(Promise.resolve(), this).assertReply(expected, description, timeout);
    }
    /**
     * throws if the bot's response is not one of the candidate strings
     * @param candidates candidate responses
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    assertReplyOneOf(candidates, description, timeout) {
        return new TestFlow(Promise.resolve(), this).assertReplyOneOf(candidates, description, timeout);
    }
}
exports.TestAdapter = TestAdapter;
/** INTERNAL support class for `TestAdapter`. */
class TestFlow {
    constructor(previous, adapter) {
        this.previous = previous;
        this.adapter = adapter;
        if (!this.previous)
            this.previous = Promise.resolve();
    }
    /**
     * Send something to the bot and expect the bot to reply
     * @param userSays text or activity simulating user input
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    test(userSays, expected, description, timeout) {
        if (!expected)
            throw new Error(".test() Missing expected parameter");
        return this.send(userSays)
            .assertReply(expected, description || `test("${userSays}", "${expected}")`, timeout);
    }
    /**
     * Send something to the bot
     * @param userSays text or activity simulating user input
     */
    send(userSays) {
        return new TestFlow(this.previous.then(() => this.adapter.receiveActivity(userSays)), this.adapter);
    }
    /**
     * Throws if the bot's response doesn't match the expected text/activity
     * @param expected expected text or activity from the bot, or callback to inspect object
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    assertReply(expected, description, timeout) {
        if (!expected)
            throw new Error(".assertReply() Missing expected parameter");
        return new TestFlow(this.previous.then(() => {
            return new Promise((resolve, reject) => {
                if (!timeout)
                    timeout = 3000;
                let interval = 0;
                let start = new Date().getTime();
                let myInterval = setInterval(() => {
                    let current = new Date().getTime();
                    if ((current - start) > timeout) {
                        let expectedActivity = (typeof expected === 'string' ? { type: botbuilder_core_1.ActivityTypes.Message, text: expected } : expected);
                        throw new Error(`${timeout}ms Timed out waiting for:${description || expectedActivity.text}`);
                    }
                    // if we have replies
                    if (this.adapter.activityBuffer.length > 0) {
                        clearInterval(myInterval);
                        let botReply = this.adapter.activityBuffer[0];
                        this.adapter.activityBuffer.splice(0, 1);
                        if (typeof expected === 'function') {
                            expected(botReply, description);
                        }
                        else if (typeof expected === 'string') {
                            assert.equal(botReply.type, botbuilder_core_1.ActivityTypes.Message, (description || '') + ` type === '${botReply.type}'. `);
                            assert.equal(botReply.text, expected, (description || '') + ` text === "${botReply.text}"`);
                        }
                        else {
                            this.validateActivity(botReply, expected);
                        }
                        resolve();
                        return;
                    }
                }, interval);
            });
        }), this.adapter);
    }
    /**
     * throws if the bot's response is not one of the candidate strings
     * @param candidates candidate responses
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    assertReplyOneOf(candidates, description, timeout) {
        return this.assertReply((activity) => {
            for (let candidate of candidates) {
                if (activity.text == candidate) {
                    return;
                }
            }
            assert.fail(`${description} FAILED, Expected one of :${JSON.stringify(candidates)}`);
        });
    }
    /**
     * Insert delay before continuing
     * @param ms ms to wait
     */
    delay(ms) {
        return new TestFlow(this.previous.then(() => {
            return new Promise((resolve, reject) => { setTimeout(() => resolve(), ms); });
        }), this.adapter);
    }
    validateActivity(activity, expected) {
        for (let prop in expected) {
            assert.equal(activity[prop], expected[prop]);
        }
    }
    then(onFulfilled) {
        return new TestFlow(this.previous.then(onFulfilled), this.adapter);
    }
    catch(onRejected) {
        return new TestFlow(this.previous.catch(onRejected), this.adapter);
    }
}
exports.TestFlow = TestFlow;
//# sourceMappingURL=testAdapter.js.map