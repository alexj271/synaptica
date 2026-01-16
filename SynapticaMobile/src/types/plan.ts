export interface Plan {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
}
