import { execSync } from 'child_process';

const API_URL = 'http://127.0.0.1:3000/api';

const runTest = () => {
    console.log("Testing AI Flow Generation...");

    // Test 1: Email Request
    const prompt1 = "Send a welcome email when a new lead is created";
    console.log(`\nPrompt: "${prompt1}"`);
    const cmd1 = `curl -s -X POST ${API_URL}/ai/generate-workflow -H "Content-Type: application/json" -d '{"prompt": "${prompt1}"}'`;
    try {
        const res1 = execSync(cmd1).toString();
        console.log("Response:", res1);
    } catch (e) { console.error("Test 1 Failed", e) }

    // Test 2: Notification Request
    const prompt2 = "Notify me if a task is overdue";
    console.log(`\nPrompt: "${prompt2}"`);
    const cmd2 = `curl -s -X POST ${API_URL}/ai/generate-workflow -H "Content-Type: application/json" -d '{"prompt": "${prompt2}"}'`;
    try {
        const res2 = execSync(cmd2).toString();
        console.log("Response:", res2);
    } catch (e) { console.error("Test 2 Failed", e) }
};

runTest();
