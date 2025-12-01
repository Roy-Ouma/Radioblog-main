const Button = ({ label, styles, icon, type, onClick }) => {
  return (
    <button
      onClick={onClick}
      type={type || 'button'}
      className={`flex justify-center items-center text-base ${styles}`}
    >
      {label}
      {icon && <div className="ml-2">{icon}</div>}
    </button>
  );
};

export default Button;
