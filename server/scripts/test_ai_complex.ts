import { execSync } from 'child_process';

const API_URL = 'http://127.0.0.1:3000/api';

const runTest = () => {
    console.log("Testing Complex AI Flow...");

    // Test 3: Complex Schedule Request
    const prompt3 = "Send a system notification to all CRM users every morning at 10 AM to start the day positively.";
    console.log(`\nPrompt: "${prompt3}"`);
    const cmd3 = `curl -s -X POST ${API_URL}/ai/generate-workflow -H "Content-Type: application/json" -d '{"prompt": "${prompt3}"}'`;
    try {
        const res3 = execSync(cmd3).toString();
        console.log("Response:", res3);
    } catch (e) { console.error("Test 3 Failed", e) }
};

runTest();
