import { Link } from "react-router-dom";

const Logo = ({ type }) => {
  return (
    <Link 
      to="/"
      className={`text-2xl font-semibold dark:text-white ${type && 'text-white text-4xl'}`}
    >
      Maseno
      <span
        className={`text-3xl text-orange-500 ${type && 'text-5xl font-bold'}`}
      >
        Radio
      </span>
    </Link>
  );
};

export default Logo;


