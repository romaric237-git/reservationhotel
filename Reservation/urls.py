from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from . import views

app_name = "Reservation"

urlpatterns = [
    path('', views.Index, name="index"),
    path('login', views.login, name="login"),
    path('my-reservations', views.myReservations, name="myReservations"),
    path('reservation-form', views.reservationForm, name="reservationForm"),
    path('updateroomslist', views.updateRoomsList, name="updateroomslist"),
    path('sendconfirmationcode', views.sendconfirmationcode, name="sendconfirmationcode"),
    path('verifyconfirmationcode', views.verifyconfirmationcode, name="verifyconfirmationcode"),
    path('sendconfirmationcodetolog', views.sendconfirmationcodetolog, name="sendconfirmationcodetolog"),
    path('verifyconfirmationcodetolog', views.verifyconfirmationcodetolog, name="verifyconfirmationcodetolog"),
    path('deletereservation', views.deleteReservation, name="deletereservation"),
    path('modifyreservation', views.modifyReservation, name="modifyreservation"),
    path('updatereservation', views.updateReservation, name="updatereservation"),
    path('verifyemailaccount', views.verifyEmailAccount, name="verifyemailaccount"),
    path('logout', views.logout, name="logout"),
    path('test', views.test, name="test"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
