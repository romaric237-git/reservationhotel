from django.contrib import admin
from .models import Room, Reservation, Client, Service, ConfirmationCode
# Register your models here.
class RoomAdmin(admin.ModelAdmin):
    list_display = ("pk", "name", "nbPlaces", "roof", "doubleBed", "oceanView", "price")


class ReservationAdmin(admin.ModelAdmin):
    list_display = ("pk", "client", "room", "checkIn", "checkOut", "confirmed", "taken", "total_cost")#, "lunch", "dressing", "taxi", "romance")


class ClientAdmin(admin.ModelAdmin):
    list_display = ("pk", "firstname", "lastname", "email", "phoneNumber")


class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "price")


admin.site.register(Room, RoomAdmin)
admin.site.register(Reservation, ReservationAdmin)
admin.site.register(Client, ClientAdmin)
admin.site.register(Service, ServiceAdmin)
admin.site.register(ConfirmationCode)