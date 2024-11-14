import { NavigatedData, Page } from '@nativescript/core';
import { TaskFormViewModel } from './task-form-view-model';

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    page.bindingContext = new TaskFormViewModel();
}