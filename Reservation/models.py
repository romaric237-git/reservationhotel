from django.db import models

# Create your models here.
class Client(models.Model):
    firstname = models.CharField(max_length=30)
    lastname = models.CharField(max_length=30)
    email= models.EmailField()
    phoneNumber = models.IntegerField()

    def __str__(self) -> str:
        return self.firstname + " " + self.lastname


class Room(models.Model):
    name = models.CharField(max_length=30)
    description = models.TextField()
    image = models.ImageField()
    nbPlaces = models.IntegerField()
    price = models.IntegerField()
    roof = models.IntegerField()
    doubleBed = models.BooleanField()
    oceanView = models.BooleanField()

    def __str__(self) -> str:
        return "[N°" + str(self.pk) + "] " + self.name

class Service(models.Model):
    name = models.CharField(max_length=50)
    price = models.IntegerField()
    costPerNight = models.BooleanField()

    def __str__(self) -> str:
        return self.name + " ("+ str(self.price) + "FCFA" + ("/nuit" if self.costPerNight else "") +")"
    
    def price_over(self):
        if self.costPerNight:
            return str(self.price) + "FCFA/nuit"
        else:
            return str(self.price) + "FCFA"


class Reservation(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    checkIn = models.DateField()
    checkOut = models.DateField()
    services = models.ManyToManyField(Service, blank=True)
    confirmed = models.BooleanField()
    taken = models.BooleanField()

    def total_cost(self):
        nbDays = (self.checkOut - self.checkIn).days
        cost = self.room.price * nbDays
        for service in self.services.all():
            if service.costPerNight:
                cost += service.price * nbDays
            else:
                cost += service.price
        return f"{cost:,} FCFA"

class ConfirmationCode(models.Model):
    code = models.IntegerField()
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    creationDate = models.DateTimeField()