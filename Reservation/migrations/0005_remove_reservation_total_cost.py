# Generated by Django 5.0.6 on 2024-06-29 00:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Reservation', '0004_service_remove_reservation_dressing_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='reservation',
            name='total_cost',
        ),
    ]
