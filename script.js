import { Amplify, Auth } from 'aws-amplify';

// Amplify Auth configuration
Amplify.configure({
    Auth: {
        region: 'your-region',  // Replace with your AWS region
        userPoolId: 'your-user-pool-id',  // Replace with your Cognito User Pool ID
        userPoolWebClientId: 'your-app-client-id'  // Replace with your App Client ID
    }
});

// Set the base API URL from API Gateway Invoke URL
const apiUrl = 'https://your-api-id.execute-api.region.amazonaws.com/prod';  // Replace with your actual API Gateway Invoke URL

// Define specific API endpoints
const uploadEndpoint = `${apiUrl}/upload`;
const searchEndpoint = `${apiUrl}/search`;
const downloadEndpoint = `${apiUrl}/download`;

// Function to get the current logged-in user's username
async function getCurrentUsername() {
    try {
        const user = await Auth.currentAuthenticatedUser();
        return user.username;  // Return the username of the logged-in user
    } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
    }
}

// Function to handle document upload
async function uploadDocument(event) {
    event.preventDefault();  // Prevent the form from submitting the traditional way

    const file = document.getElementById('document').files[0];
    const title = document.getElementById('title').value;
    const currentUsername = await getCurrentUsername();

    if (!currentUsername) {
        document.getElementById('uploadMessage').textContent = 'Please log in to upload a document.';
        return;
    }

    const fileReader = new FileReader();
    fileReader.onloadend = async () => {
        const fileContent = fileReader.result.split(',')[1];  // Base64 encoded file content

        try {
            const response = await fetch(uploadEndpoint, {
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
            console.error('Upload error:', error);
            document.getElementById('uploadMessage').textContent = 'An error occurred during upload.';
        }
    };

    fileReader.readAsDataURL(file);
}

// Function to handle document search
async function searchDocument(event) {
    event.preventDefault();

    const title = document.getElementById('searchTitle').value;
    const currentUsername = await getCurrentUsername();

    if (!currentUsername) {
        document.getElementById('searchMessage').textContent = 'Please log in to search for documents.';
        return;
    }

    try {
        const response = await fetch(searchEndpoint, {
            method: 'POST',
            body: JSON.stringify({
                user: currentUsername,
                searchTitle: title
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const documents = await response.json();
            document.getElementById('searchResults').textContent = JSON.stringify(documents, null, 2);
        } else {
            document.getElementById('searchMessage').textContent = 'Error searching documents.';
        }
    } catch (error) {
        console.error('Search error:', error);
        document.getElementById('searchMessage').textContent = 'An error occurred during search.';
    }
}

// Function to handle document download
async function downloadDocument(event) {
    event.preventDefault();

    const fileName = document.getElementById('fileName').value;
    const currentUsername = await getCurrentUsername();

    if (!currentUsername) {
        document.getElementById('downloadMessage').textContent = 'Please log in to download a document.';
        return;
    }

    try {
        const response = await fetch(`${downloadEndpoint}?user=${currentUsername}&fileName=${fileName}`, {
            method: 'GET'
        });

        if (response.ok) {
            const file = await response.blob();
            const downloadUrl = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            document.getElementById('downloadMessage').textContent = 'File downloaded successfully!';
        } else {
            document.getElementById('downloadMessage').textContent = 'Error downloading file.';
        }
    } catch (error) {
        console.error('Download error:', error);
        document.getElementById('downloadMessage').textContent = 'An error occurred during download.';
    }
}

// Attach the upload, search, and download functions to the form submission events
document.getElementById('uploadForm').addEventListener('submit', uploadDocument);
document.getElementById('searchForm').addEventListener('submit', searchDocument);
document.getElementById('downloadForm').addEventListener('submit', downloadDocument);
