import { Observable } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';
import { Firestore } from '@nativescript/firebase-firestore';

export class TaskFormViewModel extends Observable {
    private db: Firestore;
    public title: string = '';
    public dueDate: Date = new Date();
    public dueTime: Date = new Date();
    public categories: string[] = ['Work', 'Training', 'Study', 'Other'];
    public selectedCategoryIndex: number = 0;
    public subtasks: Array<{ title: string, completed: boolean }> = [];

    constructor() {
        super();
        this.db = firebase().firestore();
        this.subtasks = [];
    }

    onAddSubtask() {
        this.subtasks.push({ title: '', completed: false });
        this.notifyPropertyChange('subtasks', this.subtasks);
    }

    onRemoveSubtask(args: any) {
        const index = args.index;
        this.subtasks.splice(index, 1);
        this.notifyPropertyChange('subtasks', this.subtasks);
    }

    async onSaveTask() {
        try {
            const userId = firebase().auth().currentUser?.uid;
            const dueDateTime = new Date(
                this.dueDate.getFullYear(),
                this.dueDate.getMonth(),
                this.dueDate.getDate(),
                this.dueTime.getHours(),
                this.dueTime.getMinutes()
            );

            await this.db.collection('tasks').add({
                userId,
                title: this.title,
                dueDate: dueDateTime,
                category: this.categories[this.selectedCategoryIndex],
                subtasks: this.subtasks.filter(subtask => subtask.title.trim()),
                createdAt: new Date()
            });

            const frame = require('@nativescript/core').Frame;
            frame.topmost().goBack();
        } catch (error) {
            console.error('Error saving task:', error);
        }
    }
}