import React from "react";
import ProjectList from "./components/ProjectList";
import MainContent from "./components/MainContent";
import Footer from "./components/Footer";

const Home = () => {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center min-h-screen">
      <MainContent />
      <ProjectList />
      <Footer />
    </div>
  );
};

export default Home;
