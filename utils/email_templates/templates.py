"""
Email Template Generator
Creates professional HTML emails for various notifications
"""

from django.conf import settings


def get_base_template(content):
    """Base email template with professional styling"""
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Management System</title>
        <style>
            body {{
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7f9;
            }}
            .email-container {{
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }}
            .email-header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #ffffff;
                padding: 40px 30px;
                text-align: center;
            }}
            .email-header h1 {{
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }}
            .email-body {{
                padding: 40px 30px;
                color: #333333;
                line-height: 1.6;
            }}
            .button {{
                display: inline-block;
                padding: 14px 32px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
                transition: transform 0.2s;
            }}
            .button:hover {{
                transform: translateY(-2px);
            }}
            .info-box {{
                background-color: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
            }}
            .warning-box {{
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
                color: #856404;
            }}
            .email-footer {{
                background-color: #f8f9fa;
                padding: 30px;
                text-align: center;
                color: #6c757d;
                font-size: 14px;
            }}
            .divider {{
                height: 1px;
                background-color: #e9ecef;
                margin: 30px 0;
            }}
            .detail-row {{
                padding: 12px 0;
                border-bottom: 1px solid #e9ecef;
            }}
            .detail-label {{
                font-weight: 600;
                color: #495057;
                display: inline-block;
                width: 140px;
            }}
            .detail-value {{
                color: #212529;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            {content}
            <div class="email-footer">
                <p style="margin: 0 0 10px 0;">© 2025 Task Management System. All rights reserved.</p>
                <p style="margin: 0; font-size: 12px;">This is an automated email. Please do not reply to this message.</p>
            </div>
        </div>
    </body>
    </html>
    """


def verification_email_template(user, verification_link):
    """Email template for user verification"""
    content = f"""
        <div class="email-header">
            <h1>Welcome to Task Management System!</h1>
        </div>
        <div class="email-body">
            <h2 style="color: #333; margin-top: 0;">Hello {user.first_name or user.username},</h2>
            <p>Welcome aboard! Your account has been created successfully.</p>
            <p>To get started, please verify your email address and set up your password by clicking the button below:</p>
            
            <!-- Button using table for better email client compatibility -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                    <td align="center">
                        <table cellpadding="0" cellspacing="0">
                            <tr>
                                <td align="center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); background-color: #667eea; border-radius: 8px;">
                                    <a href="{verification_link}" target="_blank" style="font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 14px 32px; display: inline-block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                        Verify Email & Set Password
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            
            <p style="text-align: center; color: #6c757d; font-size: 13px; margin-top: 20px;">
                Or copy and paste this link in your browser:<br/>
                <a href="{verification_link}" style="color: #667eea; word-break: break-all;">{verification_link}</a>
            </p>
            
            <div class="warning-box">
                <strong>⚠️ Important:</strong> This verification link will expire in 24 hours.
            </div>
            
            <div class="info-box">
                <p style="margin: 0;"><strong>Your Account Details:</strong></p>
                <div class="detail-row">
                    <span class="detail-label">Username:</span>
                    <span class="detail-value">{user.username}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">{user.email}</span>
                </div>
                <div class="detail-row" style="border-bottom: none;">
                    <span class="detail-label">Full Name:</span>
                    <span class="detail-value">{user.get_full_name() or 'N/A'}</span>
                </div>
            </div>
            
            <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
                If you didn't request this account, please ignore this email or contact your administrator.
            </p>
        </div>
    """
    return get_base_template(content)


def task_assignment_email_template(user, task, project, assigned_by):
    """Email template for task assignment notification"""
    
    # Get priority color (case-insensitive comparison)
    priority_lower = (task.priority or 'medium').lower()
    if priority_lower == 'high':
        priority_color = '#dc2626'
    elif priority_lower == 'medium':
        priority_color = '#f59e0b'
    else:
        priority_color = '#10b981'
    
    content = f"""
        <div class="email-header">
            <h1>🎯 New Task Assigned</h1>
        </div>
        <div class="email-body">
            <h2 style="color: #333; margin-top: 0;">Hello {user.first_name or user.username},</h2>
            <p>You have been assigned a new task in the Task Management System.</p>
            
            <div class="info-box">
                <h3 style="margin-top: 0; color: #667eea;">Task Details</h3>
                {f'<div class="detail-row"><span class="detail-label">Task ID:</span><span class="detail-value"><strong style="color: #667eea; font-size: 18px;">{task.task_number}</strong></span></div>' if task.task_number else ''}
                <div class="detail-row">
                    <span class="detail-label">Task Name:</span>
                    <span class="detail-value"><strong>{task.title}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Project:</span>
                    <span class="detail-value">{project.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Priority:</span>
                    <span class="detail-value" style="color: {priority_color}; font-weight: 600;">
                        {task.priority.upper()}
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">{task.status or 'To Do'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Start Date:</span>
                    <span class="detail-value">{task.start_date.strftime('%B %d, %Y')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">{task.duration} days</span>
                </div>
                <div class="detail-row" style="border-bottom: none;">
                    <span class="detail-label">Assigned By:</span>
                    <span class="detail-value">{assigned_by.get_full_name() or assigned_by.username}</span>
                </div>
            </div>
            
            {f'''
            <div style="margin: 20px 0;">
                <h4 style="color: #495057; margin-bottom: 10px;">Description:</h4>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 3px solid #667eea;">
                    {task.description}
                </div>
            </div>
            ''' if task.description else ''}
            
            <!-- Button using table for better email client compatibility -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                    <td align="center">
                        <table cellpadding="0" cellspacing="0">
                            <tr>
                                <td align="center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); background-color: #667eea; border-radius: 8px;">
                                    <a href="{settings.FRONTEND_URL}/dashboard" target="_blank" style="font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 14px 32px; display: inline-block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                        View Task Details
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            
            <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
                Please log in to the Task Management System to view complete details and start working on this task.
            </p>
        </div>
    """
    return get_base_template(content)


def project_team_addition_email_template(user, project, added_by):
    """Email template for project team addition notification"""
    content = f"""
        <div class="email-header">
            <h1>🚀 Added to Project Team</h1>
        </div>
        <div class="email-body">
            <h2 style="color: #333; margin-top: 0;">Hello {user.first_name or user.username},</h2>
            <p>You have been added as a team member to a new project!</p>
            
            <div class="info-box">
                <h3 style="margin-top: 0; color: #667eea;">Project Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Project Name:</span>
                    <span class="detail-value"><strong>{project.name}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Start Date:</span>
                    <span class="detail-value">{project.start_date.strftime('%B %d, %Y')}</span>
                </div>
                <div class="detail-row" style="border-bottom: none;">
                    <span class="detail-label">Added By:</span>
                    <span class="detail-value">{added_by.get_full_name() or added_by.username}</span>
                </div>
            </div>
            
            {f'''
            <div style="margin: 20px 0;">
                <h4 style="color: #495057; margin-bottom: 10px;">Project Description:</h4>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 3px solid #667eea;">
                    {project.description}
                </div>
            </div>
            ''' if project.description else ''}
            
            <!-- Button using table for better email client compatibility -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                    <td align="center">
                        <table cellpadding="0" cellspacing="0">
                            <tr>
                                <td align="center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); background-color: #667eea; border-radius: 8px;">
                                    <a href="{settings.FRONTEND_URL}/dashboard" target="_blank" style="font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 14px 32px; display: inline-block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                        View Project Details
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            
            <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
                Log in to the Task Management System to collaborate with your team and view all project tasks.
            </p>
        </div>
    """
    return get_base_template(content)


def password_reset_email_template(user, reset_link):
    """Email template for password reset"""
    content = f"""
        <div class="email-header">
            <h1>🔒 Password Reset Request</h1>
        </div>
        <div class="email-body">
            <h2 style="color: #333; margin-top: 0;">Hello {user.first_name or user.username},</h2>
            <p>We received a request to reset your password for your Task Management System account.</p>
            
            <div style="text-align: center;">
                <a href="{reset_link}" class="button">Reset Password</a>
            </div>
            
            <div class="warning-box">
                <strong>⚠️ Important:</strong> This password reset link will expire in 24 hours.
            </div>
            
            <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
                If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </p>
        </div>
    """
    return get_base_template(content)


def email_verification_success_template(user, login_url):
    """Email template for successful email verification"""
    content = f"""
        <div class="email-header">
            <h1>✅ Email Verified Successfully!</h1>
        </div>
        <div class="email-body">
            <h2 style="color: #333; margin-top: 0;">Congratulations {user.first_name or user.username}! 🎉</h2>
            <p>Your email has been verified successfully and your account is now active.</p>
            
            <div class="info-box" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #10b981;">
                <h3 style="margin-top: 0; color: #10b981;">✓ Account Activated</h3>
                <p style="margin: 0; color: #047857; font-size: 15px;">
                    You can now log in and start using the Task Management System.
                </p>
            </div>
            
            <div class="info-box">
                <p style="margin: 0;"><strong>Your Login Details:</strong></p>
                <div class="detail-row">
                    <span class="detail-label">Username:</span>
                    <span class="detail-value">{user.username}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">{user.email}</span>
                </div>
                <div class="detail-row" style="border-bottom: none;">
                    <span class="detail-label">Full Name:</span>
                    <span class="detail-value">{user.get_full_name() or 'N/A'}</span>
                </div>
            </div>
            
            <!-- Login Button using table for better email client compatibility -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                    <td align="center">
                        <table cellpadding="0" cellspacing="0">
                            <tr>
                                <td align="center" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); background-color: #10b981; border-radius: 8px;">
                                    <a href="{login_url}" target="_blank" style="font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 14px 32px; display: inline-block; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                        Log In to Your Account
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            
            <p style="text-align: center; color: #6c757d; font-size: 13px; margin-top: 20px;">
                Or copy and paste this link in your browser:<br/>
                <a href="{login_url}" style="color: #10b981; word-break: break-all;">{login_url}</a>
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 3px solid #667eea;">
                <h4 style="margin-top: 0; color: #495057;">What's Next?</h4>
                <ul style="margin: 10px 0; padding-left: 20px; color: #6c757d;">
                    <li>Log in with your username and password</li>
                    <li>Explore your dashboard and assigned tasks</li>
                    <li>Collaborate with your team on projects</li>
                    <li>Track your progress and deadlines</li>
                </ul>
            </div>
            
            <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
                If you need any assistance, please contact your system administrator.
            </p>
            
            <p style="color: #6c757d; font-size: 14px;">
                Welcome aboard! We're excited to have you on the team. 🚀
            </p>
        </div>
    """
    return get_base_template(content)


def task_status_change_email_template(task, old_status, new_status, changed_by_user):
    """
    Email template for task status change notifications
    Sent to both task creator and assignee
    """
    # Determine status color
    status_colors = {
        'To Do': '#6c757d',
        'In Progress': '#ffc107',
        'Done': '#28a745'
    }
    new_status_color = status_colors.get(new_status, '#667eea')
    
    content = f"""
        <div class="email-body">
            <h2 style="color: #495057; margin-top: 0;">📋 Task Status Updated</h2>
            
            <p style="font-size: 16px; color: #6c757d;">
                The status of a task you're involved with has been changed.
            </p>
            
            <div class="info-box">
                <h3 style="margin-top: 0; color: #495057;">Task Details</h3>
                
                {f'<div class="detail-row"><span class="detail-label">Task ID:</span><span class="detail-value"><strong style="color: #667eea; font-size: 18px;">{task.task_number}</strong></span></div>' if task.task_number else ''}
                
                <div class="detail-row">
                    <span class="detail-label">Task:</span>
                    <span class="detail-value" style="font-weight: 600;">{task.title}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Previous Status:</span>
                    <span class="detail-value">{old_status or 'None'}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">New Status:</span>
                    <span class="detail-value" style="color: {new_status_color}; font-weight: 600;">
                        {new_status}
                    </span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Changed By:</span>
                    <span class="detail-value">{changed_by_user.get_full_name() or changed_by_user.username}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Project:</span>
                    <span class="detail-value">{task.project.name if task.project else 'No Project'}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Priority:</span>
                    <span class="detail-value">{task.priority}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Due Date:</span>
                    <span class="detail-value">{task.due_date.strftime('%B %d, %Y') if task.due_date else 'Not set'}</span>
                </div>
                
                <div class="detail-row" style="border-bottom: none;">
                    <span class="detail-label">Assigned To:</span>
                    <span class="detail-value">{task.assignee.get_full_name() if task.assignee else 'Unassigned'}</span>
                </div>
            </div>
            
            {f'<div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;"><strong>Description:</strong><br/>{task.description}</div>' if task.description else ''}
            
            <table cellpadding="0" cellspacing="0" border="0" style="margin: 30px auto;">
                <tr>
                    <td align="center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 0;">
                        <a href="{settings.FRONTEND_URL}/dashboard" 
                           style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                            View Task Details
                        </a>
                    </td>
                </tr>
            </table>
            
            <p style="text-align: center; color: #6c757d; font-size: 13px; margin-top: 20px;">
                Or copy and paste this link in your browser:<br/>
                <a href="{settings.FRONTEND_URL}/dashboard" style="color: #667eea; word-break: break-all;">{settings.FRONTEND_URL}/dashboard</a>
            </p>
            
            <div class="divider"></div>
            
            <p style="color: #6c757d; font-size: 14px;">
                Stay updated with your tasks and keep your team informed.
            </p>
        </div>
    """
    return get_base_template(content)
