// Home.jsx
"use client";
import React, { useState } from "react";
import ProjectList from "./components/ProjectList";
import MainContent from "./components/MainContent";
import Footer from "./components/Footer";

const Home = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <div className="flex flex-col md:flex-row justify-center items-center min-h-screen">
      <div className="order-2 md:order-1 w-full md:w-1/2 h-screen overflow-auto">
        <ProjectList onModalToggle={setModalVisible} />
      </div>
      <div className="order-1 md:order-2 w-full md:w-1/2">
        <MainContent isVisible={!modalVisible} />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
