import { NavigatedData, Page } from '@nativescript/core';
import { ExpenseFormViewModel } from './expense-form-view-model';

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = new ExpenseFormViewModel();
}