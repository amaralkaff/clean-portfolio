"use client";
import React from "react";
import { motion } from "framer-motion";

const MainContent = () => {
  return (
    <motion.div
      className="w-full md:w-2/3 p-4 flex items-center justify-center h-full md:h-screen order-first"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <div className="text-lg font-bold">
          <span className="text-black">Abu Ammar</span>
          <br />
          <span className="text-gray-600">Software Engineer</span>
        </div>
        <div className="mt-2 space-x-4 text-gray-600">
          <a href="https://read.cv/amangly" className="hover:underline" target="_blank" rel="noopener noreferrer">Resume</a>
          <a href="mailto:amaralkaff@gmail.com" className="hover:underline">Email</a>
          <a href="https://www.linkedin.com/in/amaralkaff/" className="hover:underline" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://github.com/amaralkaff" className="hover:underline" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>
    </motion.div>
  );
};

export default MainContent;
