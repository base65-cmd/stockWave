import { Link } from "react-router-dom";

const IconButton = ({ icon: Icon, link, onClick }) => (
  <Link
    to={link || "#"}
    className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
    onClick={onClick}
  >
    <Icon className="w-6 h-6 text-gray-700" />
  </Link>
);

export default IconButton;
