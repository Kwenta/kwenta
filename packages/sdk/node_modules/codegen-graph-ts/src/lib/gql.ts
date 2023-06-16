import _ from 'lodash';

export interface GqlArgs {
    [key: string]: true|GqlArgs
};

export type GqlOptions = {[arg: string]: any};

function formatGqlOptions(options: GqlOptions): string {

    return _.map(options, (v, k) => {
        let valueString: string;
        if (_.isPlainObject(v)) {
            valueString = `{${formatGqlOptions(v)}}`;
        } else if (_.isNil(v)) {
            valueString = 'null';
        } else if (v[1] == 'x' || _.isNaN(parseFloat(v.toString()))) {
            valueString = `"${v}"`;
        } else valueString = v;
        
        return `${k}:${valueString}`;
    }).join(',');
}

function formatGqlArgs(args: GqlArgs): string {
    return '{' + _.map(args, (v, k) => {
        if (v === true) {
            return k;
        }
        else {
            return `${k}${formatGqlArgs(v)}`
        }
    }).join(' ')  + '}';
}

export default function generateGql(name: string, options: GqlOptions, args: GqlArgs): string {
return `{${name}${Object.keys(options).length ? `(${formatGqlOptions(options)})` : ''}${formatGqlArgs(args)}}`
}