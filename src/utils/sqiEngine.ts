import { StudentAttempt, SQIResult, RankingResult } from '@/types';

export type { StudentAttempt, SQIResult, RankingResult }; // Re-export if needed by others, or just let them import from types.

// Weights from instructions
// 40%: wrong at least once (binary 1/0) -> If wrong >= 1, score 1. Else 0.
// 25%: importance weight (A=1, B=0.7, C=0.5)
// 20%: inverse reading/time proxy (fast=1, normal=0.7, slow=0.4)
// 15%: diagnostic quality (1 - (concept_sqi/100))

const IMPORTANCE_WEIGHTS = { 'A': 1, 'B': 0.7, 'C': 0.5 };

function getTimeProxy(time: number, expected: number): number {
    const ratio = time / expected;
    if (ratio <= 0.8) return 1.0;   // Fast
    if (ratio <= 1.2) return 0.7;   // Normal
    return 0.4;                     // Slow
}

export function computeSQI(studentId: string, attempts: StudentAttempt[]): SQIResult {
    // 1. Calculate Overall SQI
    // Formula Assumption: (Total Earned Marks / Total Max Marks) * 100
    let totalEarned = 0;
    let totalMax = 0;

    // Group by Topic and Concept
    const topicMap: Record<string, StudentAttempt[]> = {};
    const conceptMap: Record<string, StudentAttempt[]> = {};

    attempts.forEach(a => {
        // Scoring
        const max = a.marks;
        const earned = a.is_correct ? a.marks : 0; // Assuming negative marking handled in net score? 
        // Instructions say "SQI Formula (Baseline)".
        // Let's use Net Score calculation: Correct = +marks, Incorrect = -neg_marks. 
        // But SQI usually 0-100.
        // If we use Net Score, it can be negative.
        // Let's stick to (Earned / Max) * 100 for simplicity in this baseline, ignoring negative marks for the *Index*,
        // OR: (Net Score + Max Possible Loss) / (Max Possible Gain + Max Possible Loss)? No, too complex.
        // Let's use: max(0, Earned - (Correct ? 0 : Neg))?
        // Let's stick to Percentage Accuracy weighted by Marks.

        totalMax += max;
        totalEarned += earned; // Simple accuracy for now.

        // Grouping
        if (!topicMap[a.topic]) topicMap[a.topic] = [];
        topicMap[a.topic].push(a);

        const conceptKey = `${a.topic}::${a.concept}`;
        if (!conceptMap[conceptKey]) conceptMap[conceptKey] = [];
        conceptMap[conceptKey].push(a);
    });

    const overall_sqi = totalMax > 0 ? (totalEarned / totalMax) * 100 : 0;

    // 2. Topic Scores
    const topic_scores: Record<string, { topic: string; sqi: number }> = {};
    for (const [topic, atts] of Object.entries(topicMap)) {
        const tMax = atts.reduce((sum, a) => sum + a.marks, 0);
        const tEarned = atts.reduce((sum, a) => sum + (a.is_correct ? a.marks : 0), 0);
        topic_scores[topic] = {
            topic,
            sqi: tMax > 0 ? (tEarned / tMax) * 100 : 0
        };
    }

    // 3. Concept Scores & Ranking
    const concept_scores: { topic: string; concept: string; sqi: number }[] = [];
    const ranked_concepts: RankingResult[] = [];

    for (const [key, atts] of Object.entries(conceptMap)) {
        const [topic, concept] = key.split('::');

        // Concept SQI
        const cMax = atts.reduce((sum, a) => sum + a.marks, 0);
        const cEarned = atts.reduce((sum, a) => sum + (a.is_correct ? a.marks : 0), 0);
        const cSqi = cMax > 0 ? (cEarned / cMax) * 100 : 0;

        concept_scores.push({ topic, concept, sqi: Number(cSqi.toFixed(1)) });

        // Calculate Weight for Summary Customizer
        // 40%: wrong at least once
        const wrongCount = atts.filter(a => !a.is_correct).length;
        const w_wrong = wrongCount > 0 ? 1 : 0;

        // 25%: importance (Average of importance weights? Or max? Usually concept has one importance)
        // Assuming all questions in concept have same importance. Taking first.
        const imp = atts[0].importance;
        const w_imp = IMPORTANCE_WEIGHTS[imp] || 0.5;

        // 20%: time proxy (Average time proxy)
        const timeProxies = atts.map(a => getTimeProxy(a.time_taken, a.expected_time || 60)); // Default 60s
        const w_time = timeProxies.reduce((a, b) => a + b, 0) / timeProxies.length;

        // 15%: diagnostic quality (1 - (CSQI / 100))
        // If CSQI is 100 (perfect), quality need is 0. If CSQI is 0, quality need is 1.
        const w_quality = 1 - (cSqi / 100);

        // Final Weight
        const weight = (0.4 * w_wrong) + (0.25 * w_imp) + (0.2 * w_time) + (0.15 * w_quality);

        // Reasons
        const reasons: string[] = [];
        if (wrongCount > 0) reasons.push("Wrong earlier");
        if (imp === 'A') reasons.push("High importance (A)");
        if (cSqi < 60) reasons.push("Low diagnostic score");
        if (w_time < 0.6) reasons.push("Slow response time");

        ranked_concepts.push({
            topic,
            concept,
            weight: Number(weight.toFixed(2)),
            reasons
        });
    }

    // Sort ranked concepts descending by weight
    ranked_concepts.sort((a, b) => b.weight - a.weight);

    return {
        student_id: studentId,
        overall_sqi: Number(overall_sqi.toFixed(1)),
        topic_scores,
        concept_scores,
        ranked_concepts_for_summary: ranked_concepts,
        metadata: {
            diagnostic_prompt_version: "v1",
            computed_at: new Date().toISOString(),
            engine: "sqi-v0.1"
        }
    };
}
