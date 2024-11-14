import { NavigatedData, Page } from '@nativescript/core';
import { TaskDetailViewModel } from './task-detail-view-model';

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    const taskId = page.navigationContext.taskId;
    page.bindingContext = new TaskDetailViewModel(taskId);
}