import { FaLocationArrow } from "react-icons/fa6";
import { FaArrowUpFromBracket } from "react-icons/fa6";
import { FaDownload } from "react-icons/fa6";
import { useState } from "react";
import MagicButton from "./MagicButton";
import { Spotlight } from "./ui/Spotlight";
import { TextGenerateEffect } from "./ui/TextGenerateEffect";
import Cookies from "js-cookie";

const Hero = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);

  //1) We Handle File selection only
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input changed");
    console.log("Selected files:", event.target.files);
    if (event.target.files) {
      console.log("First file:", event.target.files[0]);
      setFile(event.target.files[0]);
      window.alert("File successfully selected");
    }
  };

  //1) We Handle File Upload
  const handleFileUpload = async () => {
    console.log("Checking if file exists...");
    console.log("Selected file:", file);
    // Check if file exists
    if (!file) {
      console.log("No file selected.");
      return;
    }

    setProcessing(true);

    const formData = new FormData();
    formData.append("file", file, file.name);
    console.log("FormData:", formData);

    try {
      const csrftoken = Cookies.get("csrftoken");
      const response = await fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": csrftoken || "",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const fileId = data.id;
        checkProcessingStatus(fileId);
      } else {
        throw new Error("File upload failed");
      }

      if (response.status === 404) {
        throw new Error("File upload failed: Endpoint not found (404)");
      }

      if (response.status === 403) {
        throw new Error("File upload failed: Forbidden (403)");
      }

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      console.log("File uploaded successfully");

      setTimeout(() => {
        setProcessing(false);
      }, 3000);
    } catch (error) {
      console.error(error);
      setProcessing(false);
    }
  };

  const checkProcessingStatus = async (fileId: string) => {
    try {
      console.log("Checking processing status for fileId:", fileId);
      const response = await fetch(`http://127.0.0.1:8000/status/${fileId}/`);
      console.log("Processing status response:", response);
      const data = await response.json();
      console.log("Processing status data:", data);
  
      if (response.ok) {
        if (data.status === 'completed') {
          console.log("Processing completed");
          // Update the UI to show the "Download" button
          setProcessing(false);
          setFileId(fileId);
        } else if (data.status === 'processing') {
          console.log("File still processing");
          // If still processing, poll again after a certain interval
          setTimeout(() => checkProcessingStatus(fileId), 1000);
        } else if (data.status === 'failed') {
          console.error("Processing failed");
          setProcessing(false);
          // Display an error message to the user or update the UI accordingly
          alert("File processing failed. Please try again.");
        } else {
          console.error("Unknown processing status:", data.status);
          setProcessing(false);
        }
      } else {
        console.error("Error checking processing status:", response.statusText);
        setProcessing(false);
      }
    } catch (error) {
      console.error("Error checking processing status:", error);
      setProcessing(false);
    }
  };

  return (
    <div className="pb-20 pt-36">
      <div>
        <Spotlight
          className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen"
          fill="white"
        />
        <Spotlight
          className="h-[80vh] w-[50vw] top-10 left-full"
          fill="purple"
        />
        <Spotlight className="left-80 top-28 h-[80vh] w-[50vw]" fill="blue" />
      </div>
      <div
        className="h-screen w-full dark:bg-black-100 bg-white dark:bg-grid-white/[0.03] bg-grid-black-100/[0.2]
       absolute top-0 left-0 flex items-center justify-center"
      >
        <div
          className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black-100
         bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
        />
      </div>
      <div className="flex justify-center relative my-20 z-10">
        <div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center">
          <p className="uppercase tracking-widest text-xs text-center text-blue-100 max-w-80">
            Next.js & Python
          </p>
          <TextGenerateEffect
            words="Transforming Images into Text using OCR Technology and then Translate them"
            className="text-center text-[40px] md:text-5xl lg:text-6xl"
          />
          <p className="text-center md:tracking-wider mb-4 text-sm md:text-lg lg:text-2xl">
            Let's upload your image...
          </p>
          <div className="flex w-full justify-center space-x-0.1">
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="w-1/2 max-w-xs">
              <MagicButton
                title="Select file"
                icon={<FaArrowUpFromBracket />}
                position="right"
                handleClick={() => {
                  const fileInput = document.getElementById("file-input");
                  if (fileInput) fileInput.click();
                }}
              />
            </label>
            {fileId ? (
              <a href={`http://127.0.0.1:8000/download/${fileId}/`} download>
                <MagicButton
                  title="Download"
                  icon={<FaDownload />}
                  position="right"
                  otherClasses="w-1/5 max-w-xs"
                />
              </a>
            ) : (
              <MagicButton
                title={processing ? "Processing..." : "Process"}
                icon={<FaLocationArrow />}
                position="right"
                handleClick={handleFileUpload}
                otherClasses="w-1/5 max-w-xs"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
