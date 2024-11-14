import { Observable } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';
import { Firestore } from '@nativescript/firebase-firestore';

export class DashboardViewModel extends Observable {
    private firestore: Firestore;
    public tasks: any[] = [];
    public expenses: any[] = [];
    public selectedTabIndex: number = 0;
    public completedTasks: number = 0;
    public pendingTasks: number = 0;
    public totalExpenses: number = 0;
    public monthlyAverage: number = 0;

    constructor() {
        super();
        this.firestore = firebase().firestore();
        this.loadData();
    }

    async loadData() {
        await Promise.all([
            this.loadTasks(),
            this.loadExpenses()
        ]);
        this.calculateStatistics();
    }

    private async loadTasks() {
        try {
            const userId = firebase().auth().currentUser?.uid;
            const snapshot = await this.firestore
                .collection('tasks')
                .where('userId', '==', userId)
                .get();

            this.tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.notifyPropertyChange('tasks', this.tasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    private async loadExpenses() {
        try {
            const userId = firebase().auth().currentUser?.uid;
            const snapshot = await this.firestore
                .collection('expenses')
                .where('userId', '==', userId)
                .get();

            this.expenses = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.notifyPropertyChange('expenses', this.expenses);
        } catch (error) {
            console.error('Error loading expenses:', error);
        }
    }

    private calculateStatistics() {
        // Calculate task statistics
        this.completedTasks = this.tasks.filter(task => 
            task.completedSubtasks === task.totalSubtasks
        ).length;
        this.pendingTasks = this.tasks.length - this.completedTasks;

        // Calculate expense statistics
        this.totalExpenses = this.expenses.reduce((sum, expense) => 
            sum + expense.amount, 0
        );

        const months = new Set(this.expenses.map(expense => 
            new Date(expense.date).getMonth() + new Date(expense.date).getFullYear() * 12
        )).size;
        this.monthlyAverage = months > 0 ? this.totalExpenses / months : 0;

        // Notify all changes
        this.notifyPropertyChange('completedTasks', this.completedTasks);
        this.notifyPropertyChange('pendingTasks', this.pendingTasks);
        this.notifyPropertyChange('totalExpenses', this.totalExpenses);
        this.notifyPropertyChange('monthlyAverage', this.monthlyAverage);
    }

    onNewTask() {
        const frame = require('@nativescript/core').Frame;
        frame.topmost().navigate({
            moduleName: 'pages/tasks/task-form-page',
            clearHistory: false
        });
    }

    onNewExpense() {
        const frame = require('@nativescript/core').Frame;
        frame.topmost().navigate({
            moduleName: 'pages/expenses/expense-form-page',
            clearHistory: false
        });
    }

    onTaskTap(args: any) {
        const task = this.tasks[args.index];
        const frame = require('@nativescript/core').Frame;
        frame.topmost().navigate({
            moduleName: 'pages/tasks/task-detail-page',
            context: { taskId: task.id },
            clearHistory: false
        });
    }

    onExpenseTap(args: any) {
        const expense = this.expenses[args.index];
        const frame = require('@nativescript/core').Frame;
        frame.topmost().navigate({
            moduleName: 'pages/expenses/expense-detail-page',
            context: { expenseId: expense.id },
            clearHistory: false
        });
    }

    async onLogout() {
        try {
            await firebase().auth().signOut();
            const frame = require('@nativescript/core').Frame;
            frame.topmost().navigate({
                moduleName: 'pages/login/login-page',
                clearHistory: true
            });
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }
}