import { Observable, alert } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';
import { Auth } from '@nativescript/firebase-auth';

export class RegisterViewModel extends Observable {
    private auth: Auth;
    public email: string = '';
    public password: string = '';
    public confirmPassword: string = '';
    public errorMessage: string = '';
    public isLoading: boolean = false;

    constructor() {
        super();
        this.auth = firebase().auth();
    }

    async onRegister() {
        if (!this.email || !this.password || !this.confirmPassword) {
            this.set('errorMessage', 'Please fill in all fields');
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.set('errorMessage', 'Passwords do not match');
            return;
        }

        if (this.password.length < 6) {
            this.set('errorMessage', 'Password must be at least 6 characters');
            return;
        }

        this.set('isLoading', true);
        this.set('errorMessage', '');

        try {
            console.log('Attempting registration with:', this.email);
            const userCredential = await this.auth.createUserWithEmailAndPassword(
                this.email.trim(),
                this.password
            );
            
            if (userCredential.user) {
                console.log('Registration successful:', userCredential.user.uid);
                this.navigateToDashboard();
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.set('errorMessage', this.getReadableErrorMessage(error.message));
            alert({
                title: "Registration Error",
                message: this.getReadableErrorMessage(error.message),
                okButtonText: "OK"
            });
        } finally {
            this.set('isLoading', false);
        }
    }

    onBackToLogin() {
        const frame = require('@nativescript/core').Frame;
        frame.topmost().goBack();
    }

    private navigateToDashboard() {
        const frame = require('@nativescript/core').Frame;
        frame.topmost().navigate({
            moduleName: 'pages/dashboard/dashboard-page',
            clearHistory: true
        });
    }

    private getReadableErrorMessage(errorMessage: string): string {
        if (errorMessage.includes('auth/email-already-in-use')) {
            return 'This email is already registered';
        } else if (errorMessage.includes('auth/invalid-email')) {
            return 'Invalid email address format';
        } else if (errorMessage.includes('auth/operation-not-allowed')) {
            return 'Email/password accounts are not enabled';
        } else if (errorMessage.includes('auth/weak-password')) {
            return 'Password is too weak';
        }
        return 'An error occurred. Please try again';
    }
}