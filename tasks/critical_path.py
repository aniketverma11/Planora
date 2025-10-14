"""
Critical Path Method (CPM) Calculation Engine
Implements the Critical Path Method algorithm for project scheduling
"""
from datetime import timedelta
from collections import defaultdict, deque


class CriticalPathCalculator:
    """
    Calculates the critical path for a project using the Critical Path Method (CPM).
    """
    
    def __init__(self, tasks):
        """
        Initialize the calculator with a list of tasks.
        
        Args:
            tasks: QuerySet or list of Task objects
        """
        self.tasks = list(tasks)
        self.task_dict = {task.id: task for task in self.tasks}
        self.graph = defaultdict(list)  # adjacency list for dependencies
        self.reverse_graph = defaultdict(list)  # reverse adjacency list
        
    def calculate(self):
        """
        Main method to calculate the critical path.
        
        Returns:
            dict: Contains critical tasks, paths, and project metrics
        """
        # Build dependency graphs
        self._build_dependency_graph()
        
        # Check for circular dependencies
        if self._has_circular_dependencies():
            raise ValueError("Circular dependencies detected in project tasks")
        
        # Perform topological sort
        sorted_task_ids = self._topological_sort()
        
        # Forward pass - Calculate Early Start (ES) and Early Finish (EF)
        self._forward_pass(sorted_task_ids)
        
        # Determine project duration
        project_duration = self._get_project_duration()
        
        # Backward pass - Calculate Late Start (LS) and Late Finish (LF)
        self._backward_pass(sorted_task_ids, project_duration)
        
        # Calculate float/slack
        self._calculate_float()
        
        # Identify critical tasks
        critical_tasks = self._identify_critical_tasks()
        
        # Find critical paths
        critical_paths = self._find_critical_paths()
        
        return {
            'critical_tasks': critical_tasks,
            'critical_paths': critical_paths,
            'project_duration': project_duration,
            'earliest_completion': self._get_earliest_completion_date(),
            'latest_completion': self._get_latest_completion_date(),
            'total_tasks': len(self.tasks),
            'critical_tasks_count': len(critical_tasks),
            'risk_level': self._calculate_risk_level(critical_tasks)
        }
    
    def _build_dependency_graph(self):
        """Build adjacency lists for dependencies."""
        for task in self.tasks:
            # Get all dependency relationships
            dependencies = task.dependencies.all()
            
            for dependency in dependencies:
                if dependency.id in self.task_dict:
                    # dependency -> task (dependency must finish before task starts)
                    self.graph[dependency.id].append(task.id)
                    self.reverse_graph[task.id].append(dependency.id)
    
    def _has_circular_dependencies(self):
        """
        Check for circular dependencies using DFS.
        
        Returns:
            bool: True if circular dependency exists
        """
        visited = set()
        rec_stack = set()
        
        def dfs(task_id):
            visited.add(task_id)
            rec_stack.add(task_id)
            
            for successor_id in self.graph[task_id]:
                if successor_id not in visited:
                    if dfs(successor_id):
                        return True
                elif successor_id in rec_stack:
                    return True
            
            rec_stack.remove(task_id)
            return False
        
        for task_id in self.task_dict.keys():
            if task_id not in visited:
                if dfs(task_id):
                    return True
        
        return False
    
    def _topological_sort(self):
        """
        Perform topological sort using Kahn's algorithm.
        
        Returns:
            list: Sorted task IDs
        """
        # Calculate in-degree for each task
        in_degree = {task_id: 0 for task_id in self.task_dict.keys()}
        
        for task_id in self.task_dict.keys():
            for successor_id in self.graph[task_id]:
                in_degree[successor_id] += 1
        
        # Queue of tasks with no predecessors
        queue = deque([task_id for task_id, degree in in_degree.items() if degree == 0])
        sorted_tasks = []
        
        while queue:
            task_id = queue.popleft()
            sorted_tasks.append(task_id)
            
            # Reduce in-degree for successors
            for successor_id in self.graph[task_id]:
                in_degree[successor_id] -= 1
                if in_degree[successor_id] == 0:
                    queue.append(successor_id)
        
        return sorted_tasks
    
    def _forward_pass(self, sorted_task_ids):
        """
        Forward pass: Calculate Early Start (ES) and Early Finish (EF).
        
        Args:
            sorted_task_ids: Topologically sorted task IDs
        """
        # Initialize ES values
        early_start = {task_id: 0 for task_id in self.task_dict.keys()}
        
        for task_id in sorted_task_ids:
            task = self.task_dict[task_id]
            
            # Calculate ES: max(EF of all predecessors)
            if task_id in self.reverse_graph and self.reverse_graph[task_id]:
                predecessor_finish_times = []
                for pred_id in self.reverse_graph[task_id]:
                    pred = self.task_dict[pred_id]
                    pred_ef = early_start[pred_id] + (pred.duration or 0)
                    predecessor_finish_times.append(pred_ef)
                early_start[task_id] = max(predecessor_finish_times) if predecessor_finish_times else 0
            else:
                early_start[task_id] = 0
            
            # Store ES and EF
            task.early_start_day = early_start[task_id]
            task.early_finish_day = early_start[task_id] + (task.duration or 0)
    
    def _get_project_duration(self):
        """
        Get the project duration (maximum EF).
        
        Returns:
            int: Project duration in days
        """
        return max(task.early_finish_day for task in self.tasks)
    
    def _backward_pass(self, sorted_task_ids, project_duration):
        """
        Backward pass: Calculate Late Start (LS) and Late Finish (LF).
        
        Args:
            sorted_task_ids: Topologically sorted task IDs
            project_duration: Total project duration
        """
        # Initialize LF values
        late_finish = {task_id: project_duration for task_id in self.task_dict.keys()}
        
        # Process tasks in reverse topological order
        for task_id in reversed(sorted_task_ids):
            task = self.task_dict[task_id]
            
            # Calculate LF: min(LS of all successors)
            if task_id in self.graph and self.graph[task_id]:
                successor_start_times = []
                for succ_id in self.graph[task_id]:
                    succ = self.task_dict[succ_id]
                    succ_ls = late_finish[succ_id] - (succ.duration or 0)
                    successor_start_times.append(succ_ls)
                late_finish[task_id] = min(successor_start_times) if successor_start_times else project_duration
            else:
                late_finish[task_id] = project_duration
            
            # Store LS and LF
            task.late_finish_day = late_finish[task_id]
            task.late_start_day = late_finish[task_id] - (task.duration or 0)
    
    def _calculate_float(self):
        """Calculate total float/slack for each task."""
        for task in self.tasks:
            # Total Float = LS - ES (or LF - EF)
            task.total_float = task.late_start_day - task.early_start_day
            
            # Mark as critical if float is zero
            task.is_critical = (task.total_float == 0)
    
    def _identify_critical_tasks(self):
        """
        Identify all critical tasks (tasks with zero float).
        
        Returns:
            list: List of critical task objects
        """
        return [task for task in self.tasks if task.is_critical]
    
    def _find_critical_paths(self):
        """
        Find all critical paths in the project.
        
        Returns:
            list: List of critical paths, each path is a list of task IDs
        """
        critical_task_ids = {task.id for task in self.tasks if task.is_critical}
        paths = []
        
        # Find all start tasks (critical tasks with no critical predecessors)
        start_tasks = []
        for task_id in critical_task_ids:
            critical_predecessors = [
                pred_id for pred_id in self.reverse_graph[task_id]
                if pred_id in critical_task_ids
            ]
            if not critical_predecessors:
                start_tasks.append(task_id)
        
        # DFS from each start task to find all paths
        def find_paths_dfs(task_id, current_path):
            current_path.append(task_id)
            
            # Find critical successors
            critical_successors = [
                succ_id for succ_id in self.graph[task_id]
                if succ_id in critical_task_ids
            ]
            
            if not critical_successors:
                # End of path
                paths.append(current_path[:])
            else:
                for succ_id in critical_successors:
                    find_paths_dfs(succ_id, current_path)
            
            current_path.pop()
        
        for start_task_id in start_tasks:
            find_paths_dfs(start_task_id, [])
        
        # Convert task IDs to task objects with details
        result_paths = []
        for path in paths:
            path_details = []
            for task_id in path:
                task = self.task_dict[task_id]
                path_details.append({
                    'id': task.id,
                    'title': task.title,
                    'duration': task.duration,
                    'early_start': task.early_start_day,
                    'early_finish': task.early_finish_day
                })
            result_paths.append(path_details)
        
        return result_paths
    
    def _get_earliest_completion_date(self):
        """Calculate the earliest possible completion date."""
        if not self.tasks or not self.tasks[0].start_date:
            return None
        
        # Find the minimum start date among all tasks
        min_start_date = min(
            task.start_date for task in self.tasks 
            if task.start_date
        )
        
        project_duration = self._get_project_duration()
        return min_start_date + timedelta(days=project_duration)
    
    def _get_latest_completion_date(self):
        """Calculate the latest acceptable completion date."""
        # Same as earliest for critical path
        return self._get_earliest_completion_date()
    
    def _calculate_risk_level(self, critical_tasks):
        """
        Calculate overall project risk level.
        
        Args:
            critical_tasks: List of critical tasks
            
        Returns:
            str: Risk level (low, medium, high, critical)
        """
        if not self.tasks:
            return 'low'
        
        critical_percentage = (len(critical_tasks) / len(self.tasks)) * 100
        
        if critical_percentage >= 60:
            return 'critical'
        elif critical_percentage >= 40:
            return 'high'
        elif critical_percentage >= 20:
            return 'medium'
        else:
            return 'low'


def calculate_critical_path(tasks):
    """
    Convenience function to calculate critical path for a list of tasks.
    
    Args:
        tasks: QuerySet or list of Task objects
        
    Returns:
        dict: Critical path calculation results
    """
    calculator = CriticalPathCalculator(tasks)
    return calculator.calculate()
