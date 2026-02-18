import { describe, it, expect } from 'vitest';
import { computeSQI, StudentAttempt } from './sqiEngine';

const mockData: StudentAttempt[] = [
    {
        question_id: "Q1",
        topic: "TopicA",
        concept: "Concept1",
        importance: "A",
        difficulty: "Easy",
        is_correct: true,
        time_taken: 50,
        expected_time: 60,
        marks: 10,
        neg_marks: 0
    },
    {
        question_id: "Q2",
        topic: "TopicA",
        concept: "Concept1",
        importance: "A",
        difficulty: "Easy",
        is_correct: false,
        time_taken: 50,
        expected_time: 60,
        marks: 10,
        neg_marks: 0
    }
];

describe('SQI Engine', () => {
    it('computes overall SQI correctly', () => {
        const result = computeSQI('test_student', mockData);
        // Total Marks = 20. Earned = 10. SQI = 50%.
        expect(result.overall_sqi).toBe(50);
    });

    it('calculates ranking weights', () => {
        const result = computeSQI('test_student', mockData);
        const concept = result.ranked_concepts_for_summary.find(c => c.concept === 'Concept1');
        expect(concept).toBeDefined();
        if (concept) {
            // Wrong at least once -> +0.4
            // Importance A -> +0.25 (1.0 * 0.25)
            // Time Proxy -> Normal (0.83) -> 1.0? 50/60=0.83 -> Normal=0.7? -> 0.7 * 0.2 = 0.14
            // Quality -> SQI 50 -> 1 - 0.5 = 0.5 -> 0.5 * 0.15 = 0.075
            // Total approx: 0.4 + 0.25 + 0.14 + 0.075 = 0.865
            expect(concept.weight).toBeGreaterThan(0.8);
        }
    });

    it('identifies reasons correctly', () => {
        const result = computeSQI('test_student', mockData);
        const concept = result.ranked_concepts_for_summary[0];
        expect(concept.reasons).toContain('Wrong earlier');
        expect(concept.reasons).toContain('High importance (A)');
        expect(concept.reasons).toContain('Low diagnostic score');
    });
});
