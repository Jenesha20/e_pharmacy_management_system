function getCurrentUser()
{
    return JSON.parse(localStorage.getItem("currentUser"));
}