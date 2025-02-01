import { useApp } from "../../contexts/AppContext";

export const HomePage = () => {
  const { darkMode, changeMode } = useApp();

  return (
    <div className="dark:bg-slate-800 dark:text-gray-400">
      Home Page
      <button
        onClick={changeMode}
        className="fixed p-2 text-xl bg-green-100 rounded-full bottom-4 left-4 dark:bg-gray-800 cursor-pointer hover:drop-shadow-lg"
      >
        {darkMode ? "🌞" : "🌙"}
      </button>
    </div>
  );
};
