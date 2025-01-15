from django.core.mail import send_mail
from django.template import loader
from django.utils import timezone
from datetime import timedelta
from twilio.rest import Client
from . import models
import random

class SendAgent():
    """This class contains some functions to send email
    """

    def sendConfirmEmail(name, email, message):
        template = loader.get_template('gestionPersonnel/email-contact.html')
        context = {
            'name': name,
            'message': message,
        }
        message = template.render(context)
        send_mail(
            "Réservation confirmée",
            "",
            "morryl.kotym@gmail.com",
            [email],
            fail_silently=False,
            html_message=message,
        )

    def sendVerificationEmail(name, email, code):
        template = loader.get_template('Reservation/email-verif.html')
        context = {
            'name': name,
            'code': code,
        }
        message = template.render(context)
        send_mail(
            "Confirmation de la réservation",
            "",
            "morryl.kotym@gmail.com",
            [email],
            fail_silently=False,
            html_message=message,
        )
        
    def sendVerificationMessage(name, phone, code):
        account_sid = 'ACf784655c0bea9e6f096aa557cfc1fa39'
        auth_token = '37315546c5114b14dbe842970bbdc869'
        client = Client(account_sid, auth_token)
        content = f"Bonjour {name}, votre code de vérification à usage unique est : {code}.\nHôtel de l'océan."
        message = client.messages.create(
            body=content,
            from_='+14156589915',  # Remplacez par votre numéro Twilio
            to='+237694081653'  # Numéro de téléphone de destination
        )
        print(message.sid)


class CodeAgent():
    def getTempCode(email):
        code = models.ConfirmationCode.objects.create(
            code=random.randint(1000, 9999), 
            client=models.Client.objects.filter(email=email).get(),
            creationDate=timezone.now(),
            )
        return code.code
    
    def verifyCode(code, email=None, phone=None):
        if email:
            code_found = models.ConfirmationCode.objects.filter(code=code, client__email=email)
        elif phone:
            #code_found = models.ConfirmationCode.objects.filter(code=code, client__phoneNumber=phone)
            code_found = models.ConfirmationCode.objects.filter(code=code, client__phoneNumber="694081653")
        if code_found:
            code_found = code_found.get()
            now = timezone.now()
            code_found.delete()
            if not now - timedelta(minutes=10) <= code_found.creationDate <= now:
                return False
            else: return True
        else:
            return False
