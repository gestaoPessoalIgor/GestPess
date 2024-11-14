import { Observable } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';
import { Firestore } from '@nativescript/firebase-firestore';

export class TaskDetailViewModel extends Observable {
    private db: Firestore;
    private taskId: string;
    public completedSubtasks: number = 0;
    public totalSubtasks: number = 0;

    constructor(taskId: string) {
        super();
        this.db = firebase().firestore();
        this.taskId = taskId;
        this.loadTask();
    }

    async loadTask() {
        try {
            const doc = await this.db.collection('tasks').doc(this.taskId).get();
            if (doc.exists) {
                const data = doc.data();
                Object.keys(data).forEach(key => {
                    this.set(key, data[key]);
                });
                this.updateProgress();
            }
        } catch (error) {
            console.error('Error loading task:', error);
        }
    }

    async onToggleSubtask(args: any) {
        try {
            const subtaskIndex = args.index;
            const subtasks = [...this.get('subtasks')];
            subtasks[subtaskIndex].completed = !subtasks[subtaskIndex].completed;
            
            await this.db.collection('tasks').doc(this.taskId).update({
                subtasks
            });

            this.set('subtasks', subtasks);
            this.updateProgress();
        } catch (error) {
            console.error('Error updating subtask:', error);
        }
    }

    private updateProgress() {
        const subtasks = this.get('subtasks') || [];
        this.totalSubtasks = subtasks.length;
        this.completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
        
        this.notifyPropertyChange('completedSubtasks', this.completedSubtasks);
        this.notifyPropertyChange('totalSubtasks', this.totalSubtasks);
    }

    async onDeleteTask() {
        try {
            await this.db.collection('tasks').doc(this.taskId).delete();
            const frame = require('@nativescript/core').Frame;
            frame.topmost().goBack();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }
}