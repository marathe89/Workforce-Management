import { describe, it, expect, beforeEach } from 'vitest';
import useBenchWorkflowStore from './benchWorkflowStore';

const reset = () => useBenchWorkflowStore.setState({ bookings: [], dismissed: {}, confirming: {} });

describe('benchWorkflowStore — confirmation and dismissal', () => {
  beforeEach(reset);

  it('confirm() creates one booking per row', () => {
    const { confirm } = useBenchWorkflowStore.getState();
    const result = confirm('emp-1', [{ roleId: 'role-a', percent: 40, startDate: '2026-09-08', endDate: '2026-10-31' }]);
    expect(result.ok).toBe(true);
    expect(useBenchWorkflowStore.getState().bookings.length).toBe(1);
  });

  it('duplicate confirmation while one is in flight does not create a second booking', () => {
    useBenchWorkflowStore.setState({ confirming: { 'emp-1': true } });
    const result = useBenchWorkflowStore.getState().confirm('emp-1', [{ roleId: 'role-a', percent: 40, startDate: '2026-09-08', endDate: '2026-10-31' }]);
    expect(result.ok).toBe(false);
    expect(useBenchWorkflowStore.getState().bookings.length).toBe(0);
  });

  it('dismiss / undoDismiss toggle correctly and don\'t touch bookings', () => {
    const { dismiss, undoDismiss, isDismissed } = useBenchWorkflowStore.getState();
    dismiss('emp-1', 'role-a');
    expect(useBenchWorkflowStore.getState().isDismissed('emp-1', 'role-a')).toBe(true);
    undoDismiss('emp-1', 'role-a');
    expect(useBenchWorkflowStore.getState().isDismissed('emp-1', 'role-a')).toBe(false);
    expect(useBenchWorkflowStore.getState().bookings).toEqual([]);
  });
});
