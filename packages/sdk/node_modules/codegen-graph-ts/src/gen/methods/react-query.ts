import { heading, multiBody, singleBody, types } from "../segments/body";
import { Schema } from "../types";

/**
 * Writes a single file which contains `useQuery` hooks for calling any subgraph query
 */
export default function reactquery(schema: Schema): string {

    const out: string[] = [];

    out.push(`import { useQuery, UseQueryOptions } from 'react-query';`);
    out.push(heading());

    for (const entity of schema.types) {
        const filterEntity = schema.types.find(e => e.name === entity.name + '_filter');
        if (!filterEntity) continue;

        out.push(types(entity, filterEntity));

        out.push(`export const useGet${entity.name}ById = <K extends keyof ${entity.name}Result>(url: string, options?: SingleQueryOptions, args?: ${entity.name}Args<K>, queryOptions: UseQueryOptions<Pick<${entity.name}Result, K>> = {}) => {
            const func = ${singleBody(entity)};

            const enabled = options && args;

            return useQuery(
                ['codegen-graphql', enabled ? generateGql('${entity.name}', options, args) : null],
                async () => func(url, options!, args!),
                {
                    ...queryOptions,
                    enabled: !!options && !!args,
                }
            );
        }`);
        
        out.push(`export const useGet${entity.name}s = <K extends keyof ${entity.name}Result>(url: string, options?: MultiQueryOptions<${entity.name}Filter, ${entity.name}Result>, args?: ${entity.name}Args<K>, queryOptions: UseQueryOptions<Pick<${entity.name}Result, K>[]> = {}) => {
            const func = ${multiBody(entity)};

            const enabled = options && args;

            return useQuery(
                ['codegen-graphql', enabled ? generateGql('${entity.name}s', options, args) : null],
                async () => func(url, options!, args!),
                {
                    ...queryOptions,
                    enabled: !!options && !!args,
                }
            );
        }`);
    }

    return out.join('\n');
}