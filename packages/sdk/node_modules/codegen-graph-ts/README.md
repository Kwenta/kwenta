Codegen Graph TS
====

Use `codegen-graph-ts` to generate a TypeScript (or Javascript) library which can be used to query a subgraph on [The Graph](https://thegraph.com).

* Generated functions provide full type checking and support for all options provided by the underlying GraphQL API.
* Pagination is handled automatically, so you can easily retrieve more than 1,000 records per call.
* Create standard await/async functions or [react-query](https://react-query.tanstack.com/) hooks.

## Usage

Replace the URL below with the *Queries (HTTP)* endpoint from The Graph. Then run the code snippet to create a `subgraph.ts` file. Note that you’ll need to keep the npm dependency in your project for the generated file to function. To generate JavaScript functions, rather than Typescript, add the `--js` flag to the last command. Add the `--method reactquery` option to generate [react-query](https://react-query.tanstack.com/) hooks instead of standard async/await functions.

```
npm i --save codegen-graph-ts
npx codegen-graph-ts pull https://api.thegraph.com/subgraphs/name/example-team/example-subgraph > manifest.json
npx codegen-graph-ts gen -s manifest.json -o subgraph.ts
```

Now you now have a TypeScript file, `subgraph.ts`, which can be used to query data. Review the file for the names of the generated functions.

The code snippet below could be used to display the top 1,500 user balances from a hypothetical subgraph at the example endpoint:

```
import { getManyUserBalance } from './subgraph';

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/example-team/example-subgraph';

const func = async () => {
    const topBalances = await getManyUserBalance(
        SUBGRAPH_URL,
        {
            first: 1500,
            orderBy: 'balanceOf',
            orderDirection: 'desc'
        }, {
            id: true,
            balanceOf: true,
            token: { symbol: true, name: true }
        }
    );

    console.log('Top Balances');
    for (const entry of topBalances) {
        console.log(`${entry.id}: ${entry.balanceOf.toString(2)}`);
    }
};

func();
```

## Usage with CI

You may want to add your `manifest.json` to your git repository and use a CI pipeline to generate the `subgraph.ts`. This allows your project to retain consistency and manage upgrades if the upstream subgraph changes.

In this case, you can generate the subgraph programmatically. For example:

```
const cgt = require('codegen-graph-ts');

const text = cgt.gen({
    schema: JSON.parse(fs.readFileSync('manifest.json')),
    method: 'plain' // Alternatively, set to 'react-query'
});

fs.writeFileSync(`subgraphQuery.ts`, text);
```

## Examples

* [`codegen-graph-demo`](https://github.com/dbeal-eth/codegen-graph-demo) - A simple demo that showcases the functionality of this library.
* [`@synthetixio/queries`](https://github.com/Synthetixio/js-monorepo/tree/master/packages/queries) - A library which uses `codegen-graph-ts` in its CI and delivers robust client-side integration of subgraphs with `react-query`.
