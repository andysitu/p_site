# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-06-30 18:36
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('customs_list', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='CustomsDeclaraction',
            new_name='CustomsDeclaration',
        ),
    ]
