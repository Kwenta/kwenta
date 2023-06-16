import { heading, multiBody, singleBody, types } from "../segments/body";
import { Schema } from "../types";

/**
 * Writes a single file which contains types and async functions for every queryable entity.
 */
export default function plain(schema: Schema): string {

    const out: string[] = [];

    out.push(heading());

    for (const entity of schema.types) {
        const filterEntity = schema.types.find(e => e.name === entity.name + '_filter');
        if (!filterEntity) continue;

        out.push(types(entity, filterEntity));
        out.push(`export const get${entity.name}ById = ${singleBody(entity)};`);
        out.push(`export const get${entity.name}s = ${multiBody(entity)};`);
    }

    return out.join('\n');
}