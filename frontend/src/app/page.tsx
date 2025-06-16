const apiUrl = process.env.NEXT_PUBLIC_API_URL;

fetch(`${apiUrl}/users`)
  .then((response) => response.json())
  .then((data) => console.log(data));