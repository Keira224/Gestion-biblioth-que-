from typing import Optional

from django.contrib.auth import get_user_model

from .models import Activity

User = get_user_model()


def log_activity(*, type: str, message: str, user: Optional[User] = None) -> Activity:
    return Activity.objects.create(type=type, message=message, user=user)
