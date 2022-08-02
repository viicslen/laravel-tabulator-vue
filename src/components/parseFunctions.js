import { parse } from "@babel/parser"
import { clone, mapValues, map } from "lodash";

export function functionFromString(fn) {
    let fnStr = fn.toString(),
        ast,
        astBody;

    try {
        ast = parse(fnStr,{ ranges: true });
        astBody = ast.program.body[0];
    } catch (e) {
        fnStr =  'var x = ' + fnStr;
        ast = parse(fnStr, { ranges: true });
        astBody = ast.program.body[0].declarations[0].init;
    }

    const params = astBody.params.map(param => param.name),
        body = fnStr.slice(astBody.body.range[0] + 1, astBody.body.range[1] - 1);

    return new Function(...params, body);
}

export default function parseFunctionsInObject(data) {
    const funcRegex = /(?:function\s?)?(?:[a-z\d_-]+)?\s?\(.*\)\s?(?:.+)?([=>]:)?\{(?:(?:[^}{]+|\{(?:[^}{]+|\{[^}{]*})*})*}(?:\s?\(.*\)\s?\)\s?)?)?;?$/gim,
        cloned = clone(data),
        predicate = (value) => {
            if (typeof value === 'object') {
                return parseFunctionsInObject(value);
            }

            if (typeof value === 'string' && value.match(funcRegex)) {
                try {
                    return functionFromString(value);
                } catch (exception) {
                    console.log(exception);
                }
            }

            return value;
        };

    return Array.isArray(cloned)
        ? map(cloned, predicate)
        : mapValues(cloned, predicate);
}
