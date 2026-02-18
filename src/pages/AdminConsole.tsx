import { useState } from 'react';
import { computeSQI } from '@/utils/sqiEngine';
import { StudentAttempt, SQIResult } from '@/types';

export default function AdminConsole() {
    const [prompt, setPrompt] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<SQIResult | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleCompute = async () => {
        if (!file) return;

        try {
            const text = await file.text();
            let data: StudentAttempt[] = [];

            if (file.name.endsWith('.json')) {
                data = JSON.parse(text);
            } else if (file.name.endsWith('.csv')) {
                // Simple CSV parser assumption: headers on first line
                const rows = text.split('\n').filter(r => r.trim());
                const headers = rows[0].split(',').map(h => h.trim());

                data = rows.slice(1).map(row => {
                    const values = row.split(',');
                    const obj: any = {};
                    headers.forEach((h, i) => {
                        let val: any = values[i]?.trim();
                        if (h === 'is_correct') val = val === 'true';
                        if (['time_taken', 'expected_time', 'marks', 'neg_marks'].includes(h)) val = Number(val);
                        obj[h] = val;
                    });
                    return obj as StudentAttempt;
                });
            }

            const sqiResult = computeSQI(data[0]?.username || "Student_Unknown", data);
            setResult(sqiResult);
        } catch (error) {
            console.error(error);
            alert('Error parsing file. Ensure it matches the schema.');
        }
    };

    const downloadJSON = () => {
        if (!result) return;
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `summary_customizer_input_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const copyJSON = () => {
        if (!result) return;
        navigator.clipboard.writeText(JSON.stringify(result, null, 2));
        alert('JSON copied to clipboard!');
    };

    return (
        <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', textAlign: 'left' }}>
            <h2 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                Diagnostic Agent Console
            </h2>

            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>1. Diagnostic Agent Prompt</h3>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Paste the Diagnostic Agent Prompt here..."
                    rows={6}
                    style={{ width: '100%', resize: 'vertical' }}
                />
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => console.log('Saved')} style={{ fontSize: '0.9rem', padding: '0.4em 0.8em' }}>
                        Save Prompt
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>2. Upload Student Data</h3>
                <div style={{
                    border: '2px dashed var(--glass-border)',
                    borderRadius: '8px',
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: 'rgba(255,255,255,0.02)'
                }}>
                    <input
                        type="file"
                        accept=".json,.csv"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                        {file ? (
                            <span style={{ color: 'var(--primary-color)', fontWeight: 500 }}>{file.name}</span>
                        ) : (
                            <span style={{ color: 'var(--secondary-color)' }}>Click to upload JSON or CSV</span>
                        )}
                    </label>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
                <button
                    onClick={handleCompute}
                    disabled={!file}
                    style={{
                        fontSize: '1.1rem',
                        padding: '0.8em 2em',
                        opacity: file ? 1 : 0.5,
                        cursor: file ? 'pointer' : 'not-allowed'
                    }}
                >
                    Compute SQI
                </button>
            </div>

            {result && (
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', animation: 'fadeIn 0.5s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Results</h3>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={downloadJSON} style={{ fontSize: '0.9rem', background: 'var(--secondary-color)' }}>Download JSON</button>
                            <button onClick={copyJSON} style={{ fontSize: '0.9rem', background: 'var(--secondary-color)' }}>Copy JSON</button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '1rem' }}>
                            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Overall SQI</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{result.overall_sqi}%</div>
                        </div>
                        {result.ranked_concepts_for_summary.slice(0, 2).map((c, i) => (
                            <div key={i} className="glass-panel" style={{ textAlign: 'center', padding: '1rem' }}>
                                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Priority {i + 1}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{c.concept}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>Warning: {c.reasons[0]}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ maxHeight: '300px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                        <pre style={{ margin: 0, fontSize: '0.8rem', textAlign: 'left' }}>
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
