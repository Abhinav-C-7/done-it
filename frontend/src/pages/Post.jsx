import React from "react";
import Navbar from "../components/Navbar";
import postfull from "../assets/images/post-full.png";
import home from "../assets/images/home.png";
import profile from "../assets/images/profile.png";

function Post() {
  return (
    <div>
      <div className="m-4">
        <form action="">
          <p className="font-semibold py-4 text-lg">Post your problem</p>
          <input
            type="text"
            className="border border-gray-400/60 rounded-xl w-full h-20 px-2 shadow-sm"
            placeholder="Your problem here..."
          />
          <select
            name="domain"
            id="domain"
            className="w-full rounded-xl mt-5 border border-gray-400/60 h-10"
          >
            <option value="0">Select domain</option>
            <option value="electric">Electric</option>
            <option value="plumbing">Plumbing</option>
            <option value="roofing">Roofing</option>
            <option value="Mechanical">Mechanical</option>
          </select>

          <label
            class="pt-5 block mb-2 text-sm font-medium text-black dark:text-black"
            for="file_input"
          >
            Upload file
          </label>
          <input
            class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 h-12"
            aria-describedby="file_input_help"
            id="file_input"
            type="file"
          />
          <p
            class="mt-1 text-sm text-gray-500 dark:text-gray-300"
            id="file_input_help"
          >
            SVG, PNG, JPG or GIF (MAX. 800x400px).
          </p>
        </form>
        <div className="py-5">
        <button className="justify-center p-10 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save</button>
        <button className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Post</button>
        </div>
      </div>
      <Navbar posticon={postfull} homeicon={home} profileicon={profile} />
    </div>
  );
}

export default Post;
