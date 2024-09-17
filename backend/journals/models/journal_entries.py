from .base_model import BaseModel
from django.db import models
from .account import Account
from .purchase import Purchase
from .sales import Sales
from .purchase_return import PurchaseReturn
from .sales_return import SalesReturn
from .payment import Payment
from .journal import Journal


class JournalEntries(BaseModel):
    DEBIT_CREDIT = (
        ("debit", "Debit"),
        ("credit", "Credit")
    )
    amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    debit_credit = models.CharField(max_length=200, choices=DEBIT_CREDIT)
    account = models.ForeignKey(Account, related_name='journal_entries', on_delete=models.CASCADE)
    journal = models.ForeignKey(Journal, related_name='journal_entries', on_delete=models.CASCADE, blank=True, null=True)
    purchase = models.ForeignKey(Purchase, related_name='journal_entries', on_delete=models.CASCADE, blank=True, null=True)
    sales = models.ForeignKey(Sales, related_name='journal_entries', on_delete=models.CASCADE, blank=True, null=True)
    purchase_return = models.ForeignKey(PurchaseReturn, related_name='journal_entries', on_delete=models.CASCADE, blank=True, null=True)
    sales_return = models.ForeignKey(SalesReturn, related_name='journal_entries', on_delete=models.CASCADE, blank=True, null=True)
    payments = models.ForeignKey(Payment, related_name="journal_entries", on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self):
        return self.debit_credit