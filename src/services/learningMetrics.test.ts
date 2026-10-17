import { aggregateLearningMetrics, metricHasValue } from './learningMetrics';

describe('aggregateLearningMetrics', () => {
  it('returns explicit no-data states instead of fabricated percentages', () => {
    const snapshot = aggregateLearningMetrics();

    expect(snapshot.activation.cohortSize.status).toBe('no_data');
    expect(snapshot.activation.activationRate.status).toBe('insufficient_data');
    expect(snapshot.learning.averageModuleCompletion.status).toBe('no_data');
    expect(snapshot.application.applicationRate.status).toBe('insufficient_data');
  });

  it('aggregates activation, learning and application evidence independently', () => {
    const snapshot = aggregateLearningMetrics({
      users: [{ id: 'user-1' }, { id: 'user-2' }],
      moduleProgress: [
        {
          userId: 'user-1',
          moduleId: 'sales-1',
          status: 'in_progress',
          completionPercentage: 50,
          lessonsCompleted: ['lesson-1'],
          lastAccessed: new Date('2026-09-01')
        },
        {
          userId: 'user-2',
          moduleId: 'finance-1',
          status: 'completed',
          completionPercentage: 100,
          lessonsCompleted: ['lesson-2'],
          lastAccessed: new Date('2026-09-02')
        }
      ],
      learningEvents: [
        {
          id: 'quiz-attempt',
          user_id: 'user-1',
          event_type: 'quiz_attempted',
          quiz_key: 'sales-quiz'
        },
        {
          id: 'quiz-pass',
          user_id: 'user-1',
          event_type: 'quiz_passed',
          quiz_key: 'sales-quiz'
        },
        {
          id: 'application',
          user_id: 'user-1',
          event_type: 'application_recorded'
        }
      ],
      businessActions: [
        { id: 'action-1', status: 'done', owner_user_id: 'user-2' },
        { id: 'action-2', status: 'planned' }
      ]
    });

    expect(snapshot.activation.activationRate.value).toBe(100);
    expect(snapshot.learning.activeLearners.value).toBe(2);
    expect(snapshot.learning.lessonsCompleted.value).toBe(2);
    expect(snapshot.learning.averageModuleCompletion.value).toBe(75);
    expect(snapshot.learning.quizPassRate.value).toBe(100);
    expect(snapshot.application.applicationRate.value).toBe(50);
    expect(snapshot.application.learnersWithApplicationEvidence.value).toBe(2);
    expect(metricHasValue(snapshot.application.applicationRate)).toBe(true);
  });

  it('accepts the snake_case progress rows returned by Supabase', () => {
    const snapshot = aggregateLearningMetrics({
      users: [{ id: 'user-1' }],
      moduleProgress: [
        {
          user_id: 'user-1',
          module_id: 'operations-1',
          status: 'completed',
          completion_percentage: 100,
          lessons_completed: ['lesson-1'],
          last_accessed: '2026-09-01T12:00:00.000Z'
        }
      ]
    });

    expect(snapshot.activation.activationRate.value).toBe(100);
    expect(snapshot.learning.modulesCompleted.value).toBe(1);
  });
});
