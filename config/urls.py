
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('users.urls')),
    path('', include('emprunts.urls')),
    path('', include('adherents.urls')),
    path('', include('exemplaires.urls')),
    path('', include('ouvrages.urls')),
    path('', include('core.urls')),
]

<<<<<<< HEAD
# Pour Activer l’accès aux fichiers PDF en local
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
=======
>>>>>>> codex-verify
if settings.DEBUG:
    # Pour Activer l’accès aux fichiers PDF en local
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
