export interface Type {
    name: string|null
    kind: string
    ofType: Type|null
}

export type Field = {
    name: string
    type: Type
}

export type Entity = {
    name: string
    fields: Field[]|null
    inputFields: Field[]|null
}

export type Schema = {
    types: Entity[]
}