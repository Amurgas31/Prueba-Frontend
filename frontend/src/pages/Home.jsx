import { useEffect } from "react";
import { useNavigate } from "react-router";
import Nav from "../components/Nav";

const Home = () => {
  const navigate = useNavigate();
  const token =
    localStorage.getItem("fakestore_token") ||
    sessionStorage.getItem("fakestore_token");

  const user = token
    ? sessionStorage.getItem("fakestore_user") ||
      localStorage.getItem("fakestore_user") ||
      ""
    : "";

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [navigate, token]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {token && <Nav />} {/* Muestra la navegación solo si hay token. */}
      <div className="flex flex-col items-center justify-center grow">
        <header className="text-center mx-4">
          <h1 className="text-4xl font-bold text-teal-600">
            Bienvenido {user ? ` ${user}` : ""}
          </h1>
          <p className="mt-4 text-gray-700">
            Explora las funcionalidades de nuestra gestión de posts y disfruta de la experiencia.
          </p>
        </header>
      </div>
    </div>
  );
};

export default Home;