# server/api/migrations/0003_update_content_post.py
# Run: python manage.py makemigrations
# Then: python manage.py migrate

from django.db import migrations, models
import django.db.models.deletion
import uuid

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_auto_previous'),  # Update with your latest migration
    ]

    operations = [
        # Update ContentPost PLATFORM_CHOICES to only include 3 platforms
        migrations.AlterField(
            model_name='contentpost',
            name='platform',
            field=models.CharField(
                max_length=20,
                choices=[
                    ('instagram', 'Instagram'),
                    ('youtube', 'YouTube'),
                    ('tiktok', 'TikTok'),
                ]
            ),
        ),
        
        # Add new fields
        migrations.AddField(
            model_name='contentpost',
            name='social_account',
            field=models.ForeignKey(
                blank=True,
                help_text='Linked social media account',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='content_posts',
                to='api.socialmediaaccount'
            ),
        ),
        migrations.AddField(
            model_name='contentpost',
            name='title',
            field=models.CharField(default='', help_text='Post title', max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='contentpost',
            name='admin_message',
            field=models.TextField(blank=True, help_text='Message to admin from client'),
        ),
        migrations.AddField(
            model_name='contentpost',
            name='post_url',
            field=models.URLField(blank=True, help_text='URL of posted content (set by admin)', null=True),
        ),
        migrations.AddField(
            model_name='contentpost',
            name='likes',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='contentpost',
            name='comments',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='contentpost',
            name='shares',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='contentpost',
            name='views',
            field=models.IntegerField(default=0),
        ),
        
        # Create ContentImage model
        migrations.CreateModel(
            name='ContentImage',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('image', models.ImageField(upload_to='content_images/%Y/%m/')),
                ('caption', models.CharField(blank=True, max_length=255)),
                ('order', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('content_post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='api.contentpost')),
            ],
            options={
                'ordering': ['order', 'created_at'],
            },
        ),
    ]