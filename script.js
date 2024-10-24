import { Amplify, Auth } from 'aws-amplify';

// Amplify Auth configuration
Amplify.configure({
    Auth: {
        region: 'your-region',  // Replace with your AWS region
        userPoolId: 'your-user-pool-id',  // Replace with your Cognito User Pool ID
        userPoolWebClientId: 'your-app-client-id'  // Replace with your App Client ID
    }
});

// Sign Up Logic
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        try {
            const signupResponse = await Auth.signUp({
                username: email,
                password: password
            });
            document.getElementById('signupMessage').textContent = 'Sign up successful! Please check your email to verify your account.';
        } catch (error) {
            document.getElementById('signupMessage').textContent = `Sign up failed: ${error.message}`;
        }
    });
}

// Log In Logic
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const loginResponse = await Auth.signIn(email, password);
            window.location.href = 'dashboard.html'; // Redirect to dashboard after successful login
        } catch (error) {
            document.getElementById('loginMessage').textContent = `Login failed: ${error.message}`;
        }
    });
}

// Verification Logic
const verificationForm = document.getElementById('verificationForm');
if (verificationForm) {
    verificationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('signupEmail').value; // Use the email from sign-up
        const verificationCode = document.getElementById('verificationCode').value;

        try {
            await Auth.confirmSignUp(email, verificationCode);
            document.getElementById('verificationMessage').textContent = 'Verification successful! You can now log in.';
        } catch (error) {
            document.getElementById('verificationMessage').textContent = `Verification failed: ${error.message}`;
        }
    });
}
