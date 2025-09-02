export interface Task {
  name: string;
  position: [number, number, number];
  color: number;
  description: string;
  currentTopic?: string;
  progress: number;
}

export interface Goal {
  position: [number, number, number];
  color: number;
  description: string;
  tasks: Task[];
}

export interface Goals {
  [month: string]: Goal;
}

export interface TaskScreenPosition {
  month: string;
  name: string;
  description: string;
  color: number;
  x: number;
  y: number;
}

export interface ScreenPosition {
  x: number;
  y: number;
}

// Global window interface extension
declare global {
  interface Window {
    __winterArcHighlight?: (month: string | null) => void;
    __winterArcFocusMonthCamera?: (month: string) => void;
  }
}

// Component props interface
export interface ProgressBarProps {
  progress: number;
  color: number;
}
