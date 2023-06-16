import ts from 'typescript';
import * as path from "path";

// from: https://stackoverflow.com/questions/53733138/how-do-i-type-check-a-snippet-of-typescript-code-in-memory
export function getDiagnosticsForText(
    rootDir: string,
    text: string,
    options?: ts.CompilerOptions,
    cancellationToken?: ts.CancellationToken
) {
    options = options || ts.getDefaultCompilerOptions();
    const inMemoryFilePath = path.resolve(path.join(rootDir, "__dummy-file.ts"));
    const textAst = ts.createSourceFile(inMemoryFilePath, text, options.target || ts.ScriptTarget.Latest);
    const host = ts.createCompilerHost(options, true);

    overrideIfInMemoryFile("getSourceFile", textAst);
    overrideIfInMemoryFile("readFile", text);
    overrideIfInMemoryFile("fileExists", true);

    const program = ts.createProgram({
        options,
        rootNames: [inMemoryFilePath],
        host
    });

    return ts.getPreEmitDiagnostics(program, textAst, cancellationToken);

    function overrideIfInMemoryFile(methodName: keyof ts.CompilerHost, inMemoryValue: any) {
        const originalMethod = host[methodName] as Function;
        host[methodName] = (...args: unknown[]) => {
            // resolve the path because typescript will normalize it
            // to forward slashes on windows
            const filePath = path.resolve(args[0] as string);
            if (filePath === inMemoryFilePath)
                return inMemoryValue;
            return originalMethod.apply(host, args);
        };
    }
}