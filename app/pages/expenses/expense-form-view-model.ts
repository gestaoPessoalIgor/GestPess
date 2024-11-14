import { Observable } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';
import { Firestore } from '@nativescript/firebase-firestore';

export class ExpenseFormViewModel extends Observable {
    private db: Firestore;
    public description: string = '';
    public amount: string = '';
    public date: Date = new Date();
    public categories: string[] = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];
    public selectedCategoryIndex: number = 0;
    public installments: string = '';

    constructor() {
        super();
        this.db = firebase().firestore();
    }

    async onSaveExpense() {
        try {
            const userId = firebase().auth().currentUser?.uid;
            const numInstallments = parseInt(this.installments) || 1;
            const installmentAmount = parseFloat(this.amount) / numInstallments;

            // Create an expense for each installment
            for (let i = 0; i < numInstallments; i++) {
                const installmentDate = new Date(this.date);
                installmentDate.setMonth(installmentDate.getMonth() + i);

                await this.db.collection('expenses').add({
                    userId,
                    description: this.description + (numInstallments > 1 ? ` (${i + 1}/${numInstallments})` : ''),
                    amount: installmentAmount,
                    date: installmentDate,
                    category: this.categories[this.selectedCategoryIndex],
                    totalInstallments: numInstallments,
                    installmentNumber: i + 1,
                    createdAt: new Date()
                });
            }

            const frame = require('@nativescript/core').Frame;
            frame.topmost().goBack();
        } catch (error) {
            console.error('Error saving expense:', error);
        }
    }
}