import { Observable } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';
import { Firestore } from '@nativescript/firebase-firestore';

export class ExpenseDetailViewModel extends Observable {
    private db: Firestore;
    private expenseId: string;

    constructor(expenseId: string) {
        super();
        this.db = firebase().firestore();
        this.expenseId = expenseId;
        this.loadExpense();
    }

    async loadExpense() {
        try {
            const doc = await this.db.collection('expenses').doc(this.expenseId).get();
            if (doc.exists) {
                const data = doc.data();
                Object.keys(data).forEach(key => {
                    this.set(key, data[key]);
                });
            }
        } catch (error) {
            console.error('Error loading expense:', error);
        }
    }

    async onDeleteExpense() {
        try {
            await this.db.collection('expenses').doc(this.expenseId).delete();
            const frame = require('@nativescript/core').Frame;
            frame.topmost().goBack();
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    }
}