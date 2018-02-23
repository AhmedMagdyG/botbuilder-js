const assert = require('assert');
const { BotAdapter, MiddlewareSet, TurnContext } = require('../');

const testMessage = { text: 'test', type: 'message' };

class SimpleAdapter extends BotAdapter { }

describe(`middlewareSet`, function () {
    this.timeout(5000);

    let order = '';
    let calls = 0;
    function middleware(char) {
        return (context, next) => {
            assert(context, `middleware[${calls}]: context object missing.`);
            assert(next, `middleware[${calls}]: next() function missing.`);
            calls++;
            order += char;
            return next();
        };
    }

    const set = new MiddlewareSet();
    it(`should use() middleware individually.`, function (done) {
        set.use(middleware('a')).use(middleware('b'));
        done();
    });

    it(`should use() a list of middleware.`, function (done) {
        set.use(middleware('c'), middleware('d'), middleware('e'));
        done();
    });

    it(`should run all middleware in order.`, function (done) {
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        set.run(context, () => {
            assert(calls === 5, `only "${calls} of 5" middleware called.`);
            assert(order === 'abcde', `middleware executed out of order "${order}".`)
        }).then(() => done());
    });

    it(`should run middleware with a leading and trailing edge.`, function (done) {
        let edge = '';
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        new MiddlewareSet()
            .use((context, next) => {
                edge += 'a';
                return next().then(() => {
                    edge += 'c';
                });
            })
            .run(context, () => {
                edge += 'b';
            })
            .then(() => {
                assert(edge === 'abc', `edges out of order "${edge}".`);
                done();
            });
    });
});