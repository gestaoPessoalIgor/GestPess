import { Observable, alert } from '@nativescript/core';
import { firebase } from '@nativescript/firebase-core';
import { Auth, GoogleAuthProvider } from '@nativescript/firebase-auth';

export class LoginViewModel extends Observable {
    private auth: Auth;
    public email: string = '';
    public password: string = '';
    public errorMessage: string = '';
    public isLoading: boolean = false;

    constructor() {
        super();
        this.auth = firebase().auth();
        console.log("LoginViewModel initialized");
    }

    async onLogin() {
        if (!this.email || !this.password) {
            this.set('errorMessage', 'Please fill in all fields');
            return;
        }

        this.set('isLoading', true);
        this.set('errorMessage', '');

        try {
            console.log('Attempting login with:', this.email);
            const userCredential = await this.auth.signInWithEmailAndPassword(
                this.email.trim(),
                this.password
            );
            
            if (userCredential.user) {
                console.log('Login successful:', userCredential.user.uid);
                const frame = require('@nativescript/core').Frame;
                frame.topmost().navigate({
                    moduleName: 'pages/dashboard/dashboard-page',
                    clearHistory: true
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = this.getReadableErrorMessage(error.message);
            this.set('errorMessage', errorMessage);
            alert({
                title: "Login Error",
                message: errorMessage,
                okButtonText: "OK"
            });
        } finally {
            this.set('isLoading', false);
        }
    }

    async onGoogleLogin() {
        this.set('isLoading', true);
        this.set('errorMessage', '');

        try {
            console.log('Starting Google login');
            const provider = new GoogleAuthProvider();
            const userCredential = await this.auth.signInWithProvider(provider);
            
            if (userCredential.user) {
                console.log('Google login successful:', userCredential.user.uid);
                const frame = require('@nativescript/core').Frame;
                frame.topmost().navigate({
                    moduleName: 'pages/dashboard/dashboard-page',
                    clearHistory: true
                });
            }
        } catch (error) {
            console.error('Google login error:', error);
            const errorMessage = this.getReadableErrorMessage(error.message);
            this.set('errorMessage', errorMessage);
            alert({
                title: "Google Login Error",
                message: errorMessage,
                okButtonText: "OK"
            });
        } finally {
            this.set('isLoading', false);
        }
    }

    onRegister() {
        const frame = require('@nativescript/core').Frame;
        frame.topmost().navigate({
            moduleName: 'pages/register/register-page',
            clearHistory: false
        });
    }

    private getReadableErrorMessage(errorMessage: string): string {
        console.log('Raw error message:', errorMessage);
        
        if (errorMessage.includes('auth/invalid-email')) {
            return 'Invalid email address format';
        } else if (errorMessage.includes('auth/user-not-found')) {
            return 'No user found with this email';
        } else if (errorMessage.includes('auth/wrong-password')) {
            return 'Incorrect password';
        } else if (errorMessage.includes('auth/too-many-requests')) {
            return 'Too many failed attempts. Please try again later';
        }
        return 'An error occurred. Please try again';
    }
}