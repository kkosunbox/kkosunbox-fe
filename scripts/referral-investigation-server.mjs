import fs from 'node:fs';
import ts from 'typescript';
import { spawn } from 'node:child_process';

const source = fs.readFileSync('tests/helpers/mockApiServer.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const mock = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const stopMock = await mock.startMockApiServer(3099);
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '-p', '3001'], {
  stdio: 'inherit', env: { ...process.env, NEXT_PUBLIC_API_URL: 'http://localhost:3099' },
});
child.on('exit', async code => { await stopMock(); process.exit(code ?? 0); });
process.on('SIGINT', () => child.kill('SIGINT'));
