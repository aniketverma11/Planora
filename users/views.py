from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .serializers import UserSerializer, UserListSerializer, AvailablePermissionsSerializer, CustomTokenObtainPairSerializer
from .models import CustomUser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import permissions
from .google_auth import verify_google_token
from .microsoft_auth import verify_microsoft_token
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.http import HttpResponse
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment
from io import BytesIO
from datetime import datetime
import secrets


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access user management
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.designation == 'admin'

class SignUpView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

class LoginView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = CustomTokenObtainPairSerializer

class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)


class GoogleAuthView(APIView):
    """
    Handle Google OAuth authentication
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        try:
            token = request.data.get('token')
            if not token:
                return Response(
                    {'error': 'Token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verify the Google token and get user info
            user_info = verify_google_token(token)

            # Check if user exists with this Google ID
            user = CustomUser.objects.filter(google_id=user_info['google_id']).first()

            if user:
                # User exists, log them in
                if not user.is_active:
                    return Response(
                        {'error': 'User account is disabled'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:
                # Check if user exists with this email (from regular signup)
                user = CustomUser.objects.filter(email=user_info['email']).first()
                
                if user:
                    # Link Google account to existing user
                    user.google_id = user_info['google_id']
                    user.auth_provider = 'google'
                    user.profile_picture = user_info.get('picture', '')
                    user.save()
                else:
                    # Create new user
                    username = user_info['email'].split('@')[0]
                    base_username = username
                    counter = 1
                    
                    # Ensure unique username
                    while CustomUser.objects.filter(username=username).exists():
                        username = f"{base_username}{counter}"
                        counter += 1

                    user = CustomUser.objects.create(
                        username=username,
                        email=user_info['email'],
                        first_name=user_info.get('first_name', ''),
                        last_name=user_info.get('last_name', ''),
                        google_id=user_info['google_id'],
                        profile_picture=user_info.get('picture', ''),
                        auth_provider='google',
                        password=make_password(secrets.token_urlsafe(32)),  # Random password
                    )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'profile_picture': user.profile_picture,
                    'auth_provider': user.auth_provider,
                    'designation': user.designation,
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class MicrosoftAuthView(APIView):
    """
    Handle Microsoft OAuth authentication
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        try:
            token = request.data.get('token')
            if not token:
                return Response(
                    {'error': 'Token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verify the Microsoft token and get user info
            user_info = verify_microsoft_token(token)

            # Check if user exists with this Microsoft ID
            user = CustomUser.objects.filter(microsoft_id=user_info['microsoft_id']).first()

            if user:
                # User exists, log them in
                if not user.is_active:
                    return Response(
                        {'error': 'User account is disabled'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:
                # Check if user exists with this email (from regular signup)
                user = CustomUser.objects.filter(email=user_info['email']).first()
                
                if user:
                    # Link Microsoft account to existing user
                    user.microsoft_id = user_info['microsoft_id']
                    user.auth_provider = 'microsoft'
                    user.profile_picture = user_info.get('profile_picture', '')
                    user.save()
                else:
                    # Create new user
                    username = user_info['email'].split('@')[0]
                    base_username = username
                    counter = 1
                    
                    # Ensure unique username
                    while CustomUser.objects.filter(username=username).exists():
                        username = f"{base_username}{counter}"
                        counter += 1

                    user = CustomUser.objects.create(
                        username=username,
                        email=user_info['email'],
                        first_name=user_info.get('given_name', ''),
                        last_name=user_info.get('family_name', ''),
                        microsoft_id=user_info['microsoft_id'],
                        profile_picture=user_info.get('profile_picture', ''),
                        auth_provider='microsoft',
                        password=make_password(secrets.token_urlsafe(32)),  # Random password
                    )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'profile_picture': user.profile_picture,
                    'auth_provider': user.auth_provider,
                    'designation': user.designation,
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )



class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users - only accessible to admin users
    """
    queryset = CustomUser.objects.all()
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.action == "list":
            return UserListSerializer
        return UserSerializer
    
    def get_queryset(self):
        """Allow filtering and searching users"""
        queryset = CustomUser.objects.all().order_by("-date_joined")
        
        # Filter by designation
        designation = self.request.query_params.get("designation", None)
        if designation:
            queryset = queryset.filter(designation=designation)
        
        # Filter by active status
        is_active = self.request.query_params.get("is_active", None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")
        
        # Search by username or email
        search = self.request.query_params.get("search", None)
        if search:
            queryset = queryset.filter(
                username__icontains=search
            ) | queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                first_name__icontains=search
            ) | queryset.filter(
                last_name__icontains=search
            )
        
        return queryset
    
    @action(detail=False, methods=["get"])
    def available_permissions(self, request):
        """
        Get all available permissions for tasks, projects, and users
        """
        # Get content types for our models
        apps_to_include = ["tasks", "project", "users"]
        
        permissions_data = []
        
        for app_label in apps_to_include:
            content_types = ContentType.objects.filter(app_label=app_label)
            
            for ct in content_types:
                permissions = Permission.objects.filter(content_type=ct)
                if permissions.exists():
                    permissions_data.append({
                        "app_label": app_label,
                        "model": ct.model,
                        "model_name": ct.model_class()._meta.verbose_name if ct.model_class() else ct.model,
                        "permissions": [
                            {
                                "id": p.id,
                                "name": p.name,
                                "codename": p.codename,
                                "content_type": p.content_type_id
                            }
                            for p in permissions
                        ]
                    })
        
        return Response(permissions_data)
    
    @action(detail=False, methods=["get"])
    def current_user(self, request):
        """
        Get current logged-in user with designation
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], url_path='import-excel')
    def import_excel(self, request):
        """
        Import users from Excel file
        Expected columns: Username, First Name, Last Name, Email, Password (optional)
        """
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file uploaded'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        excel_file = request.FILES['file']
        
        try:
            # Load the workbook
            wb = load_workbook(excel_file)
            ws = wb.active
            
            # Read headers
            headers = [cell.value for cell in ws[1]]
            
            # Validate headers
            required_headers = ['Username', 'First Name', 'Last Name', 'Email']
            for header in required_headers:
                if header not in headers:
                    return Response(
                        {'error': f'Missing required column: {header}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Get column indices
            username_idx = headers.index('Username')
            first_name_idx = headers.index('First Name')
            last_name_idx = headers.index('Last Name')
            email_idx = headers.index('Email')
            password_idx = headers.index('Password') if 'Password' in headers else None
            
            created_count = 0
            skipped_count = 0
            errors = []
            
            # Process each row (skip header)
            for row_num, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
                if not any(row):  # Skip empty rows
                    continue
                
                username = row[username_idx]
                first_name = row[first_name_idx]
                last_name = row[last_name_idx]
                email = row[email_idx]
                password = row[password_idx] if password_idx is not None and row[password_idx] else None
                
                # Validate required fields
                if not username or not email:
                    errors.append(f'Row {row_num}: Username and Email are required')
                    skipped_count += 1
                    continue
                
                # Check if user already exists
                if CustomUser.objects.filter(username=username).exists():
                    errors.append(f'Row {row_num}: User "{username}" already exists')
                    skipped_count += 1
                    continue
                
                if CustomUser.objects.filter(email=email).exists():
                    errors.append(f'Row {row_num}: Email "{email}" already exists')
                    skipped_count += 1
                    continue
                
                try:
                    # Create user
                    user_data = {
                        'username': username,
                        'email': email,
                        'first_name': first_name or '',
                        'last_name': last_name or '',
                        'designation': 'user',  # Default designation
                    }
                    
                    # Set password
                    if password:
                        user_data['password'] = make_password(password)
                    else:
                        # Generate random password if not provided
                        random_password = secrets.token_urlsafe(12)
                        user_data['password'] = make_password(random_password)
                    
                    CustomUser.objects.create(**user_data)
                    created_count += 1
                    
                except Exception as e:
                    errors.append(f'Row {row_num}: {str(e)}')
                    skipped_count += 1
            
            return Response({
                'message': 'Import completed',
                'created_count': created_count,
                'skipped_count': skipped_count,
                'errors': errors[:20] if errors else []  # Limit errors to first 20
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to process Excel file: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], url_path='export-excel')
    def export_excel(self, request):
        """
        Export all users to Excel file
        """
        # Create workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Users"
        
        # Define headers
        headers = ['Username', 'First Name', 'Last Name', 'Email', 'Designation', 'Date Joined', 'Is Active']
        
        # Style for headers
        header_fill = PatternFill(start_color='4472C4', end_color='4472C4', fill_type='solid')
        header_font = Font(bold=True, color='FFFFFF')
        
        # Write headers
        for col, header in enumerate(headers, start=1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal='center', vertical='center')
        
        # Get all users
        users = self.get_queryset()
        
        # Write data
        for row, user in enumerate(users, start=2):
            ws.cell(row=row, column=1, value=user.username)
            ws.cell(row=row, column=2, value=user.first_name)
            ws.cell(row=row, column=3, value=user.last_name)
            ws.cell(row=row, column=4, value=user.email)
            ws.cell(row=row, column=5, value=user.designation)
            ws.cell(row=row, column=6, value=user.date_joined.strftime('%Y-%m-%d %H:%M:%S') if user.date_joined else '')
            ws.cell(row=row, column=7, value='Yes' if user.is_active else 'No')
        
        # Adjust column widths
        for col in range(1, len(headers) + 1):
            ws.column_dimensions[chr(64 + col)].width = 20
        
        # Save to BytesIO
        excel_file = BytesIO()
        wb.save(excel_file)
        excel_file.seek(0)
        
        # Create response
        response = HttpResponse(
            excel_file.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename=users_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        
        return response
    
    @action(detail=False, methods=['get'], url_path='download-sample')
    def download_sample(self, request):
        """
        Download sample Excel template for user import
        """
        # Create workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Users Template"
        
        # Define headers
        headers = ['Username', 'First Name', 'Last Name', 'Email', 'Password']
        
        # Style for headers
        header_fill = PatternFill(start_color='4472C4', end_color='4472C4', fill_type='solid')
        header_font = Font(bold=True, color='FFFFFF')
        
        # Write headers
        for col, header in enumerate(headers, start=1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal='center', vertical='center')
        
        # Add sample data
        sample_data = [
            ['john.doe', 'John', 'Doe', 'john.doe@example.com', 'password123'],
            ['jane.smith', 'Jane', 'Smith', 'jane.smith@example.com', ''],  # Empty password will be auto-generated
            ['bob.wilson', 'Bob', 'Wilson', 'bob.wilson@example.com', 'secure456'],
        ]
        
        for row_num, data in enumerate(sample_data, start=2):
            for col, value in enumerate(data, start=1):
                ws.cell(row=row_num, column=col, value=value)
        
        # Add instructions
        ws.cell(row=6, column=1, value='Instructions:')
        ws.cell(row=7, column=1, value='1. Fill in Username, First Name, Last Name, and Email (required)')
        ws.cell(row=8, column=1, value='2. Password is optional - if empty, a random password will be generated')
        ws.cell(row=9, column=1, value='3. Remove sample data before importing')
        ws.cell(row=10, column=1, value='4. Save and upload this file')
        
        # Adjust column widths
        for col in range(1, len(headers) + 1):
            ws.column_dimensions[chr(64 + col)].width = 25
        
        # Save to BytesIO
        excel_file = BytesIO()
        wb.save(excel_file)
        excel_file.seek(0)
        
        # Create response
        response = HttpResponse(
            excel_file.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename=sample_user_import_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        
        return response


class CurrentUserView(APIView):
    """
    Get current user information
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
