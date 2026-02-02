import { execSync } from 'child_process';
import pool from '../src/config/db';
import crypto from 'crypto';

const API_URL = 'http://127.0.0.1:3000/api';

const runVerification = async () => {
    console.log('--- Workflow Engine Verification ---');

    // 1. Ensure a "Lead Created" workflow exists
    const [wfs] = await pool.query<any[]>('SELECT * FROM workflows WHERE trigger_type = ? AND is_active = true', ['Lead Created']);
    let workflowId;

    if (wfs.length === 0) {
        console.log('Creating test workflow...');
        workflowId = crypto.randomUUID();
        await pool.query(
            'INSERT INTO workflows (id, name, description, trigger_type, actions, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [workflowId, 'Test Auto-Response', 'Send email on signup', 'Lead Created', JSON.stringify([{ summary: 'Send welcome email to lead' }]), true]
        );
    } else {
        console.log(`Found ${wfs.length} active "Lead Created" workflows.`);
        workflowId = wfs[0].id;
    }

    // 2. Create a Lead using CURL
    const leadEmail = `test.workflow.${Date.now()}@example.com`;
    console.log(`Creating lead: ${leadEmail}`);

    try {
        const curlCommand = `curl -s -X POST ${API_URL}/leads -H "Content-Type: application/json" -d '{"name": "Workflow Tester", "company": "Test Corp", "email": "${leadEmail}", "source": "API"}'`;
        const output = execSync(curlCommand).toString();
        const lead = JSON.parse(output);

        if (!lead.id) throw new Error('No lead ID returned');
        console.log(`Lead created: ${lead.id}`);

        // 3. Wait for Async Execution
        console.log('Waiting for workflow execution (2s)...');
        await new Promise(r => setTimeout(r, 2000));

        // 4. Check Logs
        const [logs] = await pool.query<any[]>(
            'SELECT * FROM workflow_logs WHERE workflow_id = ? AND triggered_entity LIKE ? ORDER BY timestamp DESC LIMIT 1',
            [workflowId, `%${lead.id}%`]
        );

        if (logs.length > 0) {
            console.log('✅ SUCCESS: Workflow Log found!');
            console.log('Log:', logs[0]);
        } else {
            console.error('❌ FAILURE: No workflow log found.');
        }

    } catch (error) {
        console.error('Verification failed:', error);
    }

    process.exit(0);
};

runVerification();
