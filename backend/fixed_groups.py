import os
import django

# Set the environment variable for the settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'balance_buddy.settings')

# Initialize Django
django.setup()

# Now import your models
from journals.models import FixedGroup

# Script to add default FixedGroups
default_groups = [
    {"name": "Assets", "value": "assets"},
    {"name": "Liabilities", "value": "liabilities"},
    {"name": "Income", "value": "income"},
    {"name": "Expenses", "value": "expenses"},
    {"name": "Equity", "value": "equity"},
]

for group in default_groups:
    FixedGroup.objects.get_or_create(name=group["name"], value=group["value"])

print("Default FixedGroups added successfully.")
