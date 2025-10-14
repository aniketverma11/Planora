"""
Views for serving the React frontend
"""
from django.views.generic import View
from django.http import HttpResponse
from django.conf import settings
import os
import logging

logger = logging.getLogger(__name__)


class ReactAppView(View):
    """
    Serves the React application's index.html file.
    This allows React Router to handle all frontend routing.
    """
    
    def get(self, request, *args, **kwargs):
        try:
            # Path to the React build's index.html
            index_path = os.path.join(
                settings.BASE_DIR,
                'frontend',
                'build',
                'index.html'
            )
            
            # Read and return the index.html file
            with open(index_path, 'r', encoding='utf-8') as f:
                return HttpResponse(f.read(), content_type='text/html')
                
        except FileNotFoundError:
            logger.error(f"React build not found at {index_path}")
            return HttpResponse(
                """
                <html>
                    <body>
                        <h1>React Build Not Found</h1>
                        <p>Please build the React app first:</p>
                        <pre>cd frontend && npm run build</pre>
                    </body>
                </html>
                """,
                status=404
            )
        except Exception as e:
            logger.error(f"Error serving React app: {str(e)}")
            return HttpResponse(
                f"Error loading the application: {str(e)}",
                status=500
            )
