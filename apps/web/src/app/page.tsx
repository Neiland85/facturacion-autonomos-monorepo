import ChatBot from '../components/ChatBot';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

fetch(`${apiUrl}/users`)
  .then((response) => response.json())
  .then((data) => console.log(data));

export default function Home() {
  return (
    <main>
      <h1>Bienvenido al Bot Administrativo</h1>
      <ChatBot />
    </main>
  );
}