// call an api with basic authentication and a security header and console log the result

async function callApiWithBasicAuthAndSecurityHeader() {
    const url = 'https://api.example.com'; // replace with your API URL
    const username = 'username'; // replace with your username
    const password = 'password'; // replace with your password
    const securityHeaderValue = 'value'; // replace with your security header value

    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(username + ':' + password));
    headers.append('authorise', securityHeaderValue);

    try {
        const response = await fetch(url, { method: 'GET', headers: headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

callApiWithBasicAuthAndSecurityHeader();