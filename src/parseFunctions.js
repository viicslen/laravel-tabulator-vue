import { parse } from "@babel/parser"
import { cloneDeep } from "lodash";

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
    const funcRegex = /(?:function\s?)?(?:[a-z0-9_-]+)?\s?\(.*\)\s?(?:.+)?([=>]:)?\{(?:(?:[^}{]+|\{(?:[^}{]+|\{[^}{]*})*})*}(?:\s?\(.*\)\s?\)\s?)?)?;?$/gim,
        parsedData = cloneDeep(data);

    for (const key in parsedData) {
        if (typeof parsedData[key] !== 'string') {
            parsedData[key] = parseFunctionsInObject(parsedData[key]);
        } else if (funcRegex.test(parsedData[key])) {
            try {
                parsedData[key] = functionFromString(parsedData[key]);
            } catch (exception) {
                console.error(exception);
            }
        }
    }

    return parsedData;
}
