const FlagIcon = ({ src }) => (
  <div className=" rounded-lg bg-gray-100 flex items-center h-10 w-10 justify-center">
    <img
      src={src}
      alt="flag"
      className="w-6 h-6 rounded-full object-cover object-center overflow-hidden"
    />
  </div>
);

export default FlagIcon;
