import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import PDFViewerModal from "./PDFViewerModal";

interface MainContentProps {
  isVisible: boolean;
}

const fadeUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const MainContent: React.FC<MainContentProps> = ({ isVisible }) => {
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);

  const handleResumeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPDFModalOpen(true);
  };

  return (
    <>
      <motion.div
        className="pt-12 flex items-center justify-center h-full w-full md:w-2/3"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={fadeUpVariant}
        transition={{ duration: 0.1 }}
      >
        <div className="text-center">
          <div className="text-lg font-bold">
            <span className="text-black">Abu Ammar</span>
            <br />
            <span className="text-gray-600">Human side of zero and one</span>
          </div>
          <div className="mt-2 space-x-4 text-gray-600">
            <button
              onClick={handleResumeClick}
              className="hover:underline cursor-pointer"
            >
              Resume
            </button>
            <Link href="mailto:amaralkaff@gmail.com" className="hover:underline">
              Email
            </Link>
            <Link href="https://www.linkedin.com/in/amaralkaff/" className="hover:underline" rel="noopener noreferrer">
              LinkedIn
            </Link>
            <Link href="https://github.com/amaralkaff" className="hover:underline" rel="noopener noreferrer">
              GitHub
            </Link>
          </div>
        </div>
      </motion.div>

      <PDFViewerModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        pdfUrl="/ABU_AMMAR_RESUME.pdf"
      />
    </>
  );
};

export default MainContent;