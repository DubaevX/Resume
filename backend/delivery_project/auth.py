from rest_framework_simplejwt.authentication import JWTAuthentication

# Path that can be accessed without authentication
PUBLIC_PATHS = [
    '',  # Root path
    'api/auth/login/',
    'api/auth/refresh/',
    'api/auth/verify/',
    'admin/login/',
]

# Override default authentication for specific paths
class PathBasedAuthentication(JWTAuthentication):
    def authenticate(self, request):
        path = request.path.strip('/')
        if path in PUBLIC_PATHS:
            return None
        return super().authenticate(request) 