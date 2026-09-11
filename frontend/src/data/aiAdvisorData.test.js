import { describe, it, expect } from 'vitest';
import { parseAdvisorQuery, findBestIntent } from './aiAdvisorData';

describe('entity extraction', () => {
  it('recognizes a business unit by full name', () => {
    const e = parseAdvisorQuery('How is Insurance doing on spare capacity?');
    expect(e.businessUnit).toBe('Insurance');
  });

  it('recognizes a business unit by its short code in parentheses', () => {
    const e = parseAdvisorQuery('What is BFS looking like this month?');
    expect(e.businessUnit).toBe('Banking and Financial Services (BFS)');
  });

  it('recognizes a known skill', () => {
    expect(parseAdvisorQuery('Are we short on GenAI?').skill).toBe('GenAI');
  });

  it('recognizes a percentage threshold', () => {
    expect(parseAdvisorQuery('employees with more than 30% available').percentageThreshold).toBe(30);
  });

  it('recognizes "next month" as a 30-day timeframe', () => {
    expect(parseAdvisorQuery('who is free next month').timeframeDays).toBe(30);
  });
});

describe('intent matching — paraphrased, not verbatim', () => {
  it('a loosely-worded capacity question still lands on capacity-excess', () => {
    const { intent } = findBestIntent('where is our spare capacity sitting right now');
    expect(intent.id).toBe('capacity-excess');
  });

  it('naming a business unit sharpens the capacity card to that unit', () => {
    const { card, entities } = findBestIntent('excess capacity in Insurance');
    expect(entities.businessUnit).toBe('Insurance');
    expect(card.title).toContain('Insurance');
  });

  it('a paraphrased skill-gap question still matches', () => {
    const { intent } = findBestIntent('what skills are going to run short this quarter');
    expect(intent.id).toBe('skill-gap');
  });

  it('naming a specific skill narrows the skill-gap card to it', () => {
    const { card } = findBestIntent('is there a shortage in AWS');
    expect(card.title).toContain('AWS');
  });

  it('an unrelated/gibberish query falls back honestly instead of forcing a match', () => {
    const { intent } = findBestIntent('purple elephants dance sideways');
    expect(intent.id).toBe('fallback');
  });

  it('an empty query also falls back', () => {
    const { intent } = findBestIntent('   ');
    expect(intent.id).toBe('fallback');
  });

  it('a staffing-match question with a percentage filters the candidate list', () => {
    const { card } = findBestIntent('who can staff Project Phoenix with more than 45% available');
    expect(card.list.every((row) => Number(row.extra) > 45)).toBe(true);
    expect(card.list.length).toBeLessThan(3);
  });
});

describe('every card has a working CTA into a real page', () => {
  const questions = [
    'Where do we have excess capacity?',
    'Which employees can staff Project Phoenix?',
    'Which skills will be short in Q4?',
    'How can we reduce bench by 10%?',
    'Show me resources becoming available next month.',
    'Show me employees with more than 30% available capacity.',
    'How can we improve utilization without hiring?',
    'Should we hire or upskill for GenAI demand?',
  ];
  questions.forEach((q) => {
    it(`"${q}" resolves to a real intent with a CTA`, () => {
      const { intent, card } = findBestIntent(q);
      expect(intent.id).not.toBe('fallback');
      expect(card.cta).toBeTruthy();
      expect(card.cta.to.startsWith('/')).toBe(true);
    });
  });
});
