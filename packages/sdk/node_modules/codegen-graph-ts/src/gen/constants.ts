import { gql } from 'graphql-request';

export const INTROSPECTION_QUERY = gql`query IntrospectionQuery {
    __schema {
        types {
            name
            inputFields {
                name
                type {
                    name
                    kind
                    ofType {
                        name
                        kind
                        ofType {
                            name
                            kind
                            ofType {
                                name
                                kind
                            }
                        }
                    }
                }
            }
            fields {
                name
                type {
                    name
                    kind
                    ofType {
                        name
                        kind
                        ofType {
                            name
                            kind
                            ofType {
                                name
                                kind
                            }
                        }
                    }
                }
            }
        }
    }
}
`;