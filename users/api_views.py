from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .permissions import get_user_role


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    role = get_user_role(request.user)
    return Response({
        "username": request.user.username,
        "role": role,
    })
