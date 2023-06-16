#!/usr/bin/env node

import { Command } from 'commander';

import fs from 'fs';

import { INTROSPECTION_QUERY } from './constants';
import { Schema } from './types';
import methods from './methods';
import ts from 'typescript';

import axios from 'axios';

interface PullOptions {
    url?: string
}

interface GenOptions extends PullOptions {
    method: string
    outdir: string
    schema: Schema
    js?: boolean
}

export async function pull(options: PullOptions): Promise<Schema> {
    const res = await axios(options.url!, {
        method: 'POST',
        data: JSON.stringify({query: INTROSPECTION_QUERY })
    });

    const rawSchema = res.data.data.__schema as Schema;

    return rawSchema;
}

export function gen({ schema, method, js }: GenOptions): string {

    if (!(methods as any)[method]) {
        throw new Error(`method "${method}" not supported. please try one of: ${Object.keys(methods).join(', ')}`);
    }

    const tsCode = (methods as any)[method](schema);

    if (js) {
        return ts.transpile(tsCode);
    }
    else {
        return prettifyTypescript(tsCode);
    }
}

function prettifyTypescript(rawTs: string) {
    const sourceFile = ts.createSourceFile('subgraph.ts', rawTs, ts.ScriptTarget.Latest);
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

    return printer.printFile(sourceFile);
}

function printResultDiagnosticInfo(res: string) {
    const sourceFile = ts.createSourceFile('subgraph.ts', res, ts.ScriptTarget.Latest);

    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

    //console.log(printer.printNode(ts.EmitHint.SourceFile, sourceFile, sourceFile));

    console.log('generated subgraph queries:');
    ts.forEachChild(sourceFile, node => {

        if (ts.isVariableStatement(node)) {
            const varNode = node.declarationList.declarations[0];

            if (ts.isFunctionLike(varNode.initializer)) {
                console.log(
                    `- created: ${printer.printNode(ts.EmitHint.Unspecified, varNode.name, sourceFile)}(${printer.printList(ts.ListFormat.CommaListElements, varNode.initializer.parameters, sourceFile)})`);
            }
        }
    });
}

if (require.main === module) {
    const program = new Command();

    program
        .command('pull <url>')
        .description('retrieves the graphql schema associated with the given subgraph url')
        .action(async (options) => {
            try {
                console.error('schema pull successful!');
                console.log(JSON.stringify(await pull({ url: options } as PullOptions)));
            } catch(err) {
                console.error('failed to pull:', err);
            }
        });
    
    
    program.command('gen')
        .description('generate the typescript code to fetch from a subgraph')
        .option('-u, --url <location>', 'subgraph to extract schema from')
        .option('-s, --schema <path to .json>', 'location of a schema previously downloded with pull')
        .option('-m, --method <name>', `which top level generator to use. options: ${Object.keys(methods).join(', ')}`, 'plain')
        .option('-o, --out <file>', 'file to export the generated typescript files')
        .option('--js', 'output as plain javascript (instead of typescript)')
        .action(async (options) => {
            try {
                if (options.file && options.url) {
                    throw new Error('only one of file or url should be specified');
                }
            
                let schema: Schema;
                if (options.url) {
                    schema = await pull(options);
                }
                else if (options.schema) {
                    schema = JSON.parse(fs.readFileSync(options.schema).toString());
                }
                else {
                    throw new Error('supply either a file or url');
                }
        
                const res = gen({
                    ...options,
                    schema,
                });
    
                if (options.out) {
                    fs.writeFileSync(options.out, res);
                    
                    printResultDiagnosticInfo(res);

                    console.log('wrote file:', options.out);
                }
                else {
                    console.log(res);
                }
            } catch(err) {
                console.error('failed to gen:', err);
            }
        });
    
    program.parse(process.argv);
}