import { Entity, Type } from "./types";

export function convertType(t: Type): { name: string, arrayInfo?: { areItemsNullable: boolean }, isNullable: boolean } {
    switch (t.kind) {
        case 'NON_NULL':
            return { ...convertType(t.ofType!), isNullable: false };
        case 'LIST':
            const innerType = convertType(t.ofType!);
            return { ...innerType, arrayInfo: { areItemsNullable: innerType.isNullable }, isNullable: false }
        default:
            return { name: t.name || 'unknown', isNullable: true };
    }
}

export function mapType(graphType: Type, destType: string) {
    const convertedType = convertType(graphType);
    
    let baseType;
    let nestedStructure = false;

    switch (convertedType.name) {
        case 'ID':
        case 'Bytes':
        case 'String':
            baseType = 'string';
            break;
        case 'BigInt':
        case 'BigDecimal':
            baseType = destType === 'Filter' ? 'WeiSource' : 'Wei';
            break;
        case 'Int':
            baseType = 'number';
            break;
        case 'Boolean':
            baseType = 'boolean';
            break;
        default:
            // TODO: Improve to not be partial but `Pick`
            baseType = destType === 'Result' ? `Partial<${convertedType.name}Result>` : `${convertedType.name}${destType}`;
            nestedStructure = true;
    }

    let tsTypeName = baseType;

    if (convertedType.arrayInfo) {
        tsTypeName = convertedType.arrayInfo.areItemsNullable ? `(${tsTypeName}|null)[]` : `${tsTypeName}[]`;
    }

    if (convertedType.isNullable) {
        tsTypeName += '|null';
    }

    return { tsTypeName, baseType, nestedStructure };
}

export function queryFunctionName(e: Entity) {
    let n = e.name;

    for(let i = 0;i < n.length;i++) {
        if (n[i] !== n[i].toUpperCase()) {
            return n.substring(0, i).toLowerCase() + n.substring(i);
        }
    }
}