import { Link, useNavigate } from 'react-router';

const Nav = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("fakestore_token");
    sessionStorage.removeItem("fakestore_token");
    sessionStorage.removeItem("fakestore_user");
    sessionStorage.removeItem("fakestore_email");
    
    navigate("/");
  };

  return (
    <nav className="bg-teal-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-bold">The-Posts</div>

        <div className="flex items-center space-x-6">
          <ul className="flex space-x-4">
            <li>
              <Link to="/home" className="hover:text-gray-200 font-medium">
                Home
              </Link>
            </li>
            <li>
              <Link to="/crud" className="hover:text-gray-200 font-medium">
                CRUD
              </Link>
            </li>
          </ul>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm bg-teal-700 hover:bg-teal-800 border border-teal-500 rounded-md transition-colors font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Nav;