import { useState } from "react";
const TaskCard = ({ task }) => {

    const [isChecked,setIsChecked] = useState(false);


  return (
    <div className=" min-h-20 p-4 bg-zinc-900 rounded-xl border border-gray-700 flex items-center gap-3 shadow-md hover:shadow-lg transition-shadow duration-300">
      <label className="inline-flex items-center cursor-pointer group">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
          className="mr-3 w-5 h-5 accent-green-300 cursor-pointer"
        />
      </label>
      <div
        className={` transition-all duration-200 ${
          isChecked ? "line-through" : ""
        } ${isChecked ? "text-gray-500" : "text-white"}`}
      >
        {task}
      </div>
    </div>
  );
};

export default TaskCard;
