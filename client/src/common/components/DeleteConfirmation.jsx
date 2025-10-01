import React from "react";

const DeleteConfirmation = ({ show, onCancel, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <div className="relative slide-up bg-white rounded-lg shadow-lg w-[22rem] p-8 animate-slide-up">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20px"
            viewBox="0 -960 960 960"
            width="20px"
            fill="currentColor"
          >
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        </button>

        <div className="flex items-center justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              className="fill-red-600"
            >
              <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" />
            </svg>
          </div>
        </div>

        <p className="text-center text-lg font-medium text-gray-800 mb-6">
          Are you sure you want to delete this item?
        </p>

        <div className="flex justify-around">
          <button
            onClick={onCancel}
            className="bg-gray-400 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
