from django.shortcuts import render, redirect
from datetime import datetime
from django.http import JsonResponse
from django.utils.html import strip_tags
from django.views.decorators.csrf import csrf_exempt
from .functions import SendAgent, CodeAgent
from . import models

# Create your views here.
def Index(request):
    #rooms = models.Room.objects.order_by("-price").all()[:3]   # chambres les plus chères
    rooms = models.Room.objects.order_by("?").all()[:3]         # aléatoire
    return render(request, "Reservation/index.html", {"rooms": rooms})


def login(request):
    return render(request, "Reservation/login.html")

@csrf_exempt
def logout(request):
    if request.method == 'POST':
        if 'id' in request.session:
            del request.session['id']
            return JsonResponse({'state': 'success'})
        else:
            return JsonResponse({'state': 'failure'})
    else:
        return JsonResponse({'state': 'error', 'errorThrown': 'Bad request method.'})


def verifyEmailAccount(request):
    if request.method == 'POST':
        data = dict()
        for key, value in request.POST.items():
            if key != 'csrfmiddlewaretoken':
                data[strip_tags(key)] = strip_tags(value)
        if models.Client.objects.filter(email=data['email']).exists():
            client = models.Client.objects.filter(email=data['email']).get()
            return JsonResponse({'state': 'success', 'exists': "1", 'user-id': str(client.pk), 'phonenumber': str(client.phoneNumber)})
        else:
            return JsonResponse({'state': 'success', 'exists': "0"})
    else:
        return JsonResponse({'state': 'error', 'errorThrown': 'Bad request method.'})


@csrf_exempt
def reservationForm(request):
    data = dict()
    for key, value in request.GET.items():
        if key != 'csrfmiddlewaretoken':
            data[strip_tags(key)] = strip_tags(value)
    checkIn = data.get("check-in")
    checkOut = data.get("check-out")
    firstname = data.get("firstname")
    services = models.Service.objects.all()
    rooms = models.Room.objects.order_by("-pk").all()
    return render(request, "Reservation/reservationForm.html", {"services": services, "rooms": rooms, "checkin": checkIn, "checkout": checkOut, "firstname": firstname})


def myReservations(request):
    if request.session.get('id'):
        reservations_incoming = models.Reservation.objects.filter(client__pk=request.session.get('id'), checkIn__gte=str(datetime.now().date()))
        reservations_passed = models.Reservation.objects.filter(client__pk=request.session.get('id'), checkIn__lt=str(datetime.now().date()))
        client = models.Client.objects.filter(pk=request.session.get('id')).get()
        return render(request, "Reservation/myReservations.html", {"reservations_incoming": reservations_incoming, "reservations_passed": reservations_passed, "client": client})
    else:
        return redirect('Reservation:login')

@csrf_exempt
def updateRoomsList(request):
    if request.method == 'POST':
        data = dict()
        for key, value in request.POST.items():
            if key != 'csrfmiddlewaretoken':
                data[strip_tags(key)] = strip_tags(value)
        
        rooms = models.Room.objects.filter(nbPlaces=data['nb-pers'])
        if data["pref3"] == '1':
            rooms = models.Room.objects.filter(roof__gte=2)
        if data["pref2"] == '1':
            rooms = rooms.filter(oceanView=True)
            print("ok")
        if data["pref1"] == '1':
            rooms = rooms.filter(doubleBed=True)
        rooms = rooms.order_by("price").all()
        """
        if data["pref3"] == '1':
            rooms = models.Room.objects.filter(nbPlaces=data['nb-pers'], oceanView=data["pref2"], doubleBed=data["pref1"], roof__gte=2)
        else:
            rooms = models.Room.objects.filter(nbPlaces=data['nb-pers'], oceanView=data["pref2"], doubleBed=data["pref1"], roof__gte=2)
        """
        rooms_to_send = {}
        for room in rooms:
            rooms_to_send["N°" + str(room.pk)] = {}
            rooms_to_send["N°" + str(room.pk)]["pk"] = str(room.pk)
            rooms_to_send["N°" + str(room.pk)]["imageurl"] = str(room.image.url)
            rooms_to_send["N°" + str(room.pk)]["name"] = str(room.name)
            rooms_to_send["N°" + str(room.pk)]["price"] = str(room.price)
        return JsonResponse({'state': 'success', 'rooms': rooms_to_send})
    else:
        return JsonResponse({'state': 'error', 'errorThrown': 'Bad request method.'})


@csrf_exempt
def sendconfirmationcode(request):
    if request.method == 'POST':
        data = dict()
        for key, value in request.POST.items():
            if key != 'csrfmiddlewaretoken':
                data[strip_tags(key)] = strip_tags(value)
        if not models.Client.objects.filter(email=data['email']).exists():
            models.Client.objects.create(firstname=data['firstname'], lastname=data['lastname'], email=data['email'], phoneNumber=data['phonenumber'])
        roomId = data['room-selected'].split("-")[1]
        reservation = models.Reservation()
        reservation.client=models.Client.objects.filter(email=data['email']).get()
        reservation.room=models.Room.objects.filter(pk=roomId).get()
        reservation.checkIn=data['check-in']
        reservation.checkOut=data['check-out']
        reservation.confirmed=False
        reservation.taken=False
        reservation.save()
        supps = {k: v for k, v in data.items() if k.startswith("supp")}
        for cle, valeur in supps.items():
            if valeur == '1':
                id = cle.replace("supp", "")
                reservation.services.add(models.Service.objects.filter(pk=id).get())
        reservation.save()
        if data["confirmMode"] == "email":
            SendAgent.sendVerificationEmail(data["firstname"], data["email"], CodeAgent.getTempCode(data['email']))
            return JsonResponse({'state': 'success', 'reservation-id': str(reservation.pk)})
        elif data["confirmMode"] == "sms":
            SendAgent.sendVerificationMessage(data["firstname"], data["phonenumber"], CodeAgent.getTempCode(data['email']))
            return JsonResponse({'state': 'success', 'reservation-id': str(reservation.pk)})
        else:
            return JsonResponse({'state': 'error'})
    else:
        return JsonResponse({'state': 'error', 'errorThrown': 'Bad request method.'})

@csrf_exempt
def sendconfirmationcodetolog(request):
    if request.method == 'POST':
        data = dict()
        for key, value in request.POST.items():
            if key != 'csrfmiddlewaretoken':
                data[strip_tags(key)] = strip_tags(value)
        if not models.Client.objects.filter(email=data['email']).exists():
            models.Client.objects.create(firstname=data['firstname'], lastname=data['lastname'], email=data['email'], phoneNumber=data['phonenumber'])
        client = models.Client.objects.filter(email=data['email']).get()
        if data["confirmMode"] == "email":
            SendAgent.sendVerificationEmail(client.firstname, data["email"], CodeAgent.getTempCode(data['email']))
            return JsonResponse({'state': 'success'})
        elif data["confirmMode"] == "sms":
            SendAgent.sendVerificationMessage(client.firstname, client.phoneNumber, CodeAgent.getTempCode(data['email']))
            return JsonResponse({'state': 'success'})
        else:
            return JsonResponse({'state': 'error'})
    else:
        return JsonResponse({'state': 'error', 'errorThrown': 'Bad request method.'})


@csrf_exempt
def verifyconfirmationcode(request):
    if request.method == 'POST':
        data = dict()
        for key, value in request.POST.items():
            if key != 'csrfmiddlewaretoken':
                data[strip_tags(key)] = strip_tags(value)
        if data["confirmMode"] == "email":
            if CodeAgent.verifyCode(data["code"], email=data['email']) == True:
                request.session['id'] = models.Client.objects.filter(email=data['email']).get().pk
                reservation = models.Reservation.objects.filter(pk=data['reservation-id']).get()
                reservation.confirmed = True
                reservation.save()
                return JsonResponse({'state': 'success'})
            else:
                return JsonResponse({'state': 'error1'})
        elif data["confirmMode"] == "sms":
            if CodeAgent.verifyCode(data["code"], phone=data['phonenumber']) == True:
                request.session['id'] = models.Client.objects.filter(email=data['email']).get().pk
                reservation = models.Reservation.objects.filter(pk=data['reservation-id']).get()
                reservation.confirmed = True
                reservation.save()
                return JsonResponse({'state': 'success'})
            else:
                return JsonResponse({'state': 'error1'})
        else:
            return JsonResponse({'state': 'error2'})
    else:
        return JsonResponse({'state': 'error', 'errorThrown': 'Bad request method.'})


@csrf_exempt
def verifyconfirmationcodetolog(request):
    if request.method == 'POST':
        data = dict()
        for key, value in request.POST.items():
            if key != 'csrfmiddlewaretoken':
                data[strip_tags(key)] = strip_tags(value)
        if data["confirmMode"] == "email":
            if CodeAgent.verifyCode(data["code"], email=data['email']) == True:
                request.session['id'] = models.Client.objects.filter(email=data['email']).get().pk
                return JsonResponse({'state': 'success'})
            else:
                return JsonResponse({'state': 'error1'})
        elif data["confirmMode"] == "sms":
            if CodeAgent.verifyCode(data["code"], phone=data['phonenumber']) == True:
                request.session['id'] = models.Client.objects.filter(email=data['email']).get().pk
                return JsonResponse({'state': 'success'})
            else:
                return JsonResponse({'state': 'error1'})
        else:
            return JsonResponse({'state': 'error2'})
    else:
        return JsonResponse({'state': 'error', 'errorThrown': 'Bad request method.'})


@csrf_exempt
def deleteReservation(request):
    if request.method == 'POST':
        data = dict()
        for key, value in request.POST.items():
            if key != 'csrfmiddlewaretoken':
                data[strip_tags(key)] = strip_tags(value)
        reservation = models.Reservation.objects.filter(pk=data['reservation-id']).get()
        #if not reservation.taken:
        reservation.delete()
        return JsonResponse({'state': 'success'})
        #else:
        #    return JsonResponse({'state': 'error', 'errorThrown': 'Cette réservation a déjà été prise'})
    else:
        return JsonResponse({'state': 'error', 'errorThrown': 'Bad request method.'})


@csrf_exempt
def modifyReservation(request):
    if request.method == 'GET':
        data = dict()
        for key, value in request.GET.items():
            if key != 'csrfmiddlewaretoken':
                data[strip_tags(key)] = strip_tags(value)
        reservation = models.Reservation.objects.filter(pk=data['reservation-id']).get()
        services = models.Service.objects.all()
        rooms = models.Room.objects.order_by("-pk").all()
        return render(request, "Reservation/modReservationForm.html", {"services": services, "rooms": rooms, "reservation": reservation})
    else:
        return JsonResponse({'state': 'error', 'errorThrown': 'Bad request method.'})


@csrf_exempt
def updateReservation(request):
    if request.method == 'POST':
        data = dict()
        for key, value in request.POST.items():
            if key != 'csrfmiddlewaretoken':
                data[strip_tags(key)] = strip_tags(value)
        reservation = models.Reservation.objects.filter(pk=data['reservation-id']).get()
        roomId = data['room-selected'].split("-")[1]
        reservation.room=models.Room.objects.filter(pk=roomId).get()
        reservation.checkIn=data['check-in']
        reservation.checkOut=data['check-out']
        supps = {k: v for k, v in data.items() if k.startswith("supp")}
        reservation.save()
        reservation.services.set({})
        for cle, valeur in supps.items():
            if valeur == '1':
                id = cle.replace("supp", "")
                reservation.services.add(models.Service.objects.filter(pk=id).get())
        reservation.save()
        return JsonResponse({'state': 'success'})
    else:
        return JsonResponse({'state': 'error', 'errorThrown': 'Bad request method.'})


def test(request):
    image_model = models.Room.objects.filter(pk=1).get()
    return render(request, "Reservation/test.html", {"image_model": image_model})