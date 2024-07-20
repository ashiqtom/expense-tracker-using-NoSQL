document.getElementById('signupForm').addEventListener('submit', async function(event) {
    try {
        event.preventDefault();
        const data = {
            username: event.target.username.value,
            email: event.target.email.value,
            password: event.target.password.value
        };
        const response = await axios.post(`/user/signup`, data);
        alert(response.data.message);
        window.location.href = "../login/login.html";
    } catch (error) {
        console.log(error);
        document.body.innerHTML += `<div style="color:red;">${error.response.data.err} <div>`;
    }
});