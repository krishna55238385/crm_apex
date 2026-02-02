
import { execSync } from 'child_process';

const run = () => {
    try {
        console.log("Fetching leads from API...");
        const cmd = 'curl -s http://localhost:3000/api/leads';
        const res = execSync(cmd).toString();

        console.log("Raw Response:", res);

        try {
            const json = JSON.parse(res);
            console.log("Parsed JSON:", JSON.stringify(json, null, 2));
            console.log("Count:", Array.isArray(json) ? json.length : "Not an array");
        } catch (e) {
            console.error("Failed to parse JSON", e);
        }

    } catch (e: any) {
        console.error("Request failed:", e.message);
    }
};

run();
