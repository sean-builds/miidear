const fs = require('node:fs');
const path = require('node:path');
const validator = require('gltf-validator');

async function main() {
  const modelName = process.argv[2] || 'invitation.glb';
  if (!['invitation.glb','invitation-mobile.glb'].includes(modelName)) throw new Error('Choose an invitation model');
  const file = path.resolve(__dirname, '..', modelName);
  const report = await validator.validateBytes(new Uint8Array(fs.readFileSync(file)), {
    uri: modelName, maxIssues: 100,
  });
  const summary = {
    validator: 'Khronos glTF Validator',
    model: modelName,
    bytes: fs.statSync(file).size,
    errors: report.issues.numErrors,
    warnings: report.issues.numWarnings,
    messages: report.issues.messages,
  };
  fs.writeFileSync(path.resolve(__dirname, modelName === 'invitation.glb' ? '../validation.json' : '../validation-mobile.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify(summary, null, 2));
  process.exitCode = summary.errors ? 1 : 0;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
