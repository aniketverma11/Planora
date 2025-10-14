"""
Script to create a near-critical task for demonstration
This will modify your project structure to show a near-critical task
"""

from django.core.management.base import BaseCommand
from tasks.models import Task, Project
from tasks.critical_path import calculate_critical_path

class Command(BaseCommand):
    help = 'Create near-critical task for demonstration'

    def add_arguments(self, parser):
        parser.add_argument('project_id', type=int, help='Project ID')

    def handle(self, *args, **options):
        project_id = options['project_id']
        
        try:
            project = Project.objects.get(id=project_id)
            self.stdout.write(f"\n{'='*70}")
            self.stdout.write(f"CREATING NEAR-CRITICAL TASK FOR PROJECT: {project.name}")
            self.stdout.write(f"{'='*70}\n")
            
            # Get existing tasks
            tasks = Task.objects.filter(project_id=project_id)
            
            # Find the tasks
            feature_dev = tasks.filter(title__icontains='Feature Development').first()
            test_task = tasks.filter(title__icontains='test').first()
            security = tasks.filter(title__icontains='Security').first()
            ui_design = tasks.filter(title__icontains='UI Design').first()
            
            if not all([feature_dev, test_task]):
                self.stdout.write(self.style.ERROR("Required tasks not found!"))
                return
            
            self.stdout.write("\n1. Found existing tasks:")
            self.stdout.write(f"   - {feature_dev.title}")
            self.stdout.write(f"   - {test_task.title}")
            if security:
                self.stdout.write(f"   - {security.title}")
            if ui_design:
                self.stdout.write(f"   - {ui_design.title}")
            
            # Fix: Remove Security Testing from test dependencies
            if security and test_task:
                self.stdout.write("\n2. Removing blocking dependency...")
                test_task.dependencies.remove(security)
                test_task.save()
                self.stdout.write(self.style.SUCCESS(f"   ✓ Removed {security.title} from {test_task.title} dependencies"))
                
                # Make security depend on Feature Development only
                security.dependencies.clear()
                security.dependencies.add(feature_dev)
                security.save()
                self.stdout.write(self.style.SUCCESS(f"   ✓ {security.title} now runs parallel to {test_task.title}"))
            
            # Make sure test depends on Feature Development
            test_task.dependencies.clear()
            test_task.dependencies.add(feature_dev)
            test_task.save()
            
            # Create a convergence point if UI Design exists
            if ui_design:
                self.stdout.write("\n3. Setting up convergence point...")
                ui_design.dependencies.clear()
                ui_design.dependencies.add(test_task)
                if security:
                    ui_design.dependencies.add(security)
                ui_design.save()
                self.stdout.write(self.style.SUCCESS(f"   ✓ {ui_design.title} now depends on both paths"))
            
            # Recalculate critical path
            self.stdout.write("\n4. Recalculating critical path...")
            tasks = Task.objects.filter(project_id=project_id).prefetch_related('dependencies')
            result = calculate_critical_path(tasks)
            
            # Save results
            for task in tasks:
                task.save(update_fields=[
                    'early_start_day', 'early_finish_day',
                    'late_start_day', 'late_finish_day',
                    'total_float', 'is_critical'
                ])
            
            self.stdout.write(self.style.SUCCESS("   ✓ Critical path calculated and saved"))
            
            # Show results
            self.stdout.write(f"\n{'='*70}")
            self.stdout.write("RESULTS")
            self.stdout.write(f"{'='*70}\n")
            
            tasks = Task.objects.filter(project_id=project_id).order_by('early_start_day')
            
            critical_count = 0
            near_critical_count = 0
            normal_count = 0
            
            self.stdout.write(f"{'Task':<30} {'Duration':<10} {'Float':<10} {'Category'}")
            self.stdout.write("-" * 70)
            
            for task in tasks:
                if task.total_float == 0:
                    category = "🔴 CRITICAL"
                    critical_count += 1
                elif task.total_float <= 2:
                    category = "🟠 NEAR-CRITICAL"
                    near_critical_count += 1
                else:
                    category = "🟢 NORMAL"
                    normal_count += 1
                
                self.stdout.write(f"{task.title:<30} {task.duration:<10} {task.total_float:<10} {category}")
            
            self.stdout.write(f"\n{'='*70}")
            self.stdout.write("FLOAT ANALYSIS SUMMARY")
            self.stdout.write(f"{'='*70}\n")
            self.stdout.write(self.style.ERROR(f"🔴 Critical (0 float):        {critical_count} tasks"))
            self.stdout.write(self.style.WARNING(f"🟠 Near-Critical (1-2 float): {near_critical_count} tasks"))
            self.stdout.write(self.style.SUCCESS(f"🟢 Normal (>2 float):         {normal_count} tasks"))
            
            if near_critical_count > 0:
                self.stdout.write(f"\n{self.style.SUCCESS('SUCCESS! You now have near-critical tasks!')}")
                self.stdout.write("\nGo to Critical Path tab and you'll see:")
                self.stdout.write(f"🟠 Near-Critical (1-2 days): {near_critical_count} task(s)")
            else:
                self.stdout.write(f"\n{self.style.WARNING('Note: No near-critical tasks created.')}")
                self.stdout.write("This means all paths have >2 days difference or are critical.")
            
        except Project.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"Project {project_id} not found!"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {str(e)}"))
