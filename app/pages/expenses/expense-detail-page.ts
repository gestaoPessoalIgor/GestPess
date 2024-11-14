import { NavigatedData, Page } from '@nativescript/core';
import { ExpenseDetailViewModel } from './expense-detail-view-model';

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    const expenseId = page.navigationContext.expenseId;
    page.bindingContext = new ExpenseDetailViewModel(expenseId);
}