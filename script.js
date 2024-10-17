import { Amplify, Auth } from 'aws-amplify';

// Amplify Auth configuration
Amplify.configure({
    Auth: {
        region: 'your-region',
        userPoolId: 'your-user-pool-id',
        userPoolWebClientId: 'your-app-client-id'
    }
});

// Get the logged-in user's username
async function getCurrentUsername() {
    try {
        const user = await Auth.currentAuthenticatedUser();
        return user.username;
    } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
    }
}

// Handle document upload
async function uploadDocument(event) {
    event.preventDefault();

    const file = document.getElementById('document').files[0];
    const title = document.getElementById('title').value;
    const currentUsername = await getCurrentUsername();

    if (!currentUsername) {
        document.getElementById('uploadMessage').textContent = 'Please log in to upload a document.';
        return;
    }

    const apiUrl = 'https://your-api-id.execute-api.region.amazonaws.com/upload';

    const fileReader = new FileReader();
    fileReader.onloadend = async () => {
        const fileContent = fileReader.result.split(',')[1];

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify({
                    fileContent: fileContent,
                    fileName: file.name,
                    user: currentUsername,
                    title: title
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                document.getElementById('uploadMessage').textContent = 'File uploaded successfully!';
            } else {
                document.getElementById('uploadMessage').textContent = 'Error uploading file.';
            }
        } catch (error) {
            document.getElementById('uploadMessage').textContent = 'An error occurred during upload.';
        }
    };

    fileReader.readAsDataURL(file);
}

document.getElementById('uploadForm').addEventListener('submit', uploadDocument);
