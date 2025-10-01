import BreadCrumbs from "./BreadCrumbs";
import NavbarButton from "./NavbarButton";

function PageHeader({ title, button = [] }) {
  return (
    <div className="flex items-center h-[60px] w-full px-3 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1),_0_1px_2px_rgba(0,0,0,0.2)] text-gray-600">
      <div className="flex items-center gap-1.5 justify-center">
        <div className="font-semibold text-base border-r border-gray-300 px-1.5">
          <h1>{title}</h1>
        </div>
        <BreadCrumbs />
      </div>
      <div className="ml-auto flex items-center gap-2">
        {button.map(({ name, icon, bgColor, link, onClick }, index) => (
          <NavbarButton
            key={index}
            name={name}
            icon={icon}
            bgColor={bgColor}
            link={link}
            onClick={onClick}
          />
        ))}
      </div>
    </div>
  );
}

export default PageHeader;
