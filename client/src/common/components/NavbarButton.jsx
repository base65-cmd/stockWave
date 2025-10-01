import { Tooltip } from "antd";
import { Link } from "react-router-dom";

const NavbarButton = ({
  name,
  icon: Icon,
  bgColor = "bg-blue-500",
  link,
  onClick,
}) => {
  const classNames = `flex items-center h-9 gap-1 px-3 py-2 rounded-lg text-white text-[12px] font-medium ${bgColor} hover:opacity-90 transition`;

  return link ? (
    <Tooltip title={name} placement="left">
      <Link to={link} className={classNames}>
        {Icon && <Icon className="w-4 h-4" />}

        <span className="max-[600px]:hidden">{name}</span>
      </Link>
    </Tooltip>
  ) : onClick ? (
    <Tooltip title={name} placement="top">
      <button onClick={onClick} className={`${classNames} cursor-pointer`}>
        {Icon && <Icon className="w-4 h-4" />}
        {name && <span className="max-[600px]:hidden">{name}</span>}
      </button>
    </Tooltip>
  ) : null;
};

export default NavbarButton;
