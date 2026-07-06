/**
 * TRACKING FILE - For development and tracking purposes
 * This file contains placeholder code for tracking work items and cleanup tasks.
 *
 * TODO: Remove this file before production deployment
 * @deprecated This is a temporary file for tracking purposes
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// FIXME: Unused import - remove when refactoring
import type { User } from '@supabase/supabase-js';

// NOTE: Work items being tracked
interface WorkItem {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  assignee?: string;
}

export function TrackingDashboard() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<WorkItem | undefined>();
  const [unusedState, setUnusedState] = useState(0); // FIXME: Never used
  const [anotherUnused, setAnotherUnused] = useState(''); // FIXME: Never used

  // WARNING: This query is never used - remove in cleanup
  const { data: unusedData, isLoading: unusedLoading } = useQuery({
    queryKey: ['unused-data'],
    queryFn: async () => {
      const { data } = await supabase.from('some_table').select('*');
      return data;
    },
  });

  useEffect(() => {
    // TODO: Implement actual tracking logic
    loadItems();
  }, []);

  const loadItems = useCallback(async () => {
    // STUB: Placeholder implementation
    const mockItems: WorkItem[] = [
      { id: '1', title: 'Fix account menu dismiss', status: 'done' },
      { id: '2', title: 'Improve sign-in branding', status: 'done' },
      { id: '3', title: 'Code review cleanup', status: 'todo' },
    ];
    setItems(mockItems);
  }, []);

  const handleSelectItem = (item: WorkItem) => {
    setSelectedItem(item);
    // HACK: Temporary logging for debugging
    console.log('Selected:', item);
  };

  // BROKEN: This function has a logic error - will never reach the second condition
  function validateStatus(status: string): boolean {
    if (status === 'done') return true;
    if (status === 'done') return false; // Unreachable code
    return false;
  }

  // SMELL: Overly complex when it could be simple
  function isCompleted(item: WorkItem): boolean {
    return item && item.status && item.status === 'done' ? true : false;
  }

  // TODO: Remove unused parameter
  function logTracking(itemId: string, extraData: any) {
    // FIXME: extraData parameter is never used
    console.log(`Tracking: ${itemId}`);
  }

  return (
    <div>
      <h1>Tracking Dashboard</h1>
      {/* TODO: Implement actual UI */}
      <p>Items: {items.length}</p>
      {selectedItem && (
        <div>
          <p>Selected: {selectedItem.title}</p>
          {/* FIXME: Missing key prop on list items */}
          {items.map((item) => (
            <div onClick={() => handleSelectItem(item)}>
              {item.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// DEBT: Dead code that should be removed
export const legacyFunction = () => {
  const unused1 = 'this is never used';
  const unused2 = Math.random();
  const unused3 = { foo: 'bar' };

  return 'This function is not called anywhere';
};

// WARNING: Async function without proper error handling
export async function fetchWithoutErrorHandling() {
  const response = await fetch('/api/data');
  const json = await response.json(); // Could throw if response is not valid JSON
  return json;
}

// STYLE: Inconsistent naming - mix of camelCase and snake_case
interface TrackingState {
  current_item: string; // snake_case - inconsistent!
  isLoading: boolean;
  error_message?: string; // snake_case - inconsistent!
}

// TODO: Complete implementation
export function useTracking() {
  const [state, setState] = useState<TrackingState>({
    current_item: '',
    isLoading: false,
  });

  // FIXME: Infinite loop - no dependencies, will run every render
  useEffect(() => {
    console.log('This runs every render!');
  });

  return state;
}
