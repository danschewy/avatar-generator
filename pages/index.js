import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import { ResponsiveAdUnit } from "nextjs-google-adsense";
import ParticleAnimation from "react-particle-animation";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const settings = {
  canvas: {
    canvasFillSpace: true,
    width: 200,
    height: 200,
    useBouncyWalls: false,
  },
  particle: {
    particleCount: 50,
    color: "#94ecbe",
    minSize: 2,
    maxSize: 5,
  },
  velocity: {
    directionAngle: 0,
    directionAngleVariance: 360,
    minSpeed: 1,
    maxSpeed: 3,
  },
  opacity: {
    minOpacity: 0,
    maxOpacity: 0.5,
    opacityTransitionTime: 3000,
  },
};
const dataToString = async (file) => {
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.addEventListener(
      "load",
      () => {
        // convert image file to base64 string
        resolve(reader.result);
      },
      false
    );
    reader.readAsDataURL(file);
  });
};

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [preview1, setPreview1] = useState("");
  const [preview2, setPreview2] = useState("");
  const ref = useRef(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!e.target.dad.files[0] || !e.target.mom.files[0]) {
      return;
    }
    const dadFile = await dataToString(e.target.dad.files[0]);
    const momFile = await dataToString(e.target.mom.files[0]);
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dad: dadFile,
        mom: momFile,
        gender: e.target.gender.checked ? "girl" : "boy",
      }),
    });
    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }
    setPrediction(prediction);

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
      setPrediction(prediction);
    }
  };

  useEffect(() => {
    var ads = document.getElementsByClassName("adsbygoogle").length;
    for (var i = 0; i < ads; i++) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {}
    }
  }, []);

  return (
    <div className="container max-w-3xl mx-auto bg-pink-100 bg-opacity-50 relative p-2 md:p-5 rounded-md shadow-lg">
      <ParticleAnimation
        numParticles={500}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          zIndex: -1,
        }}
        className={"rounded-md"}
      />
      <Head>
        <title>Baby Maker</title>
      </Head>
      <div class="flex flex-row w-full justify-center items gap-2">
        <img
          src="https://illustrations.popsy.co/pink/cute-smiling-cat.svg"
          className="w-12"
        />
        <h1 className="py-6 text-center font-bold text-2xl">
          Generate Your Baby
        </h1>
        <img
          src="https://illustrations.popsy.co/pink/cute-dog.svg"
          className="w-12"
        />
      </div>
      <div className="text-center">
        <p className="text-lg text-orange-400 font-semibold">
          See what you and your special someone would look like as a custom
          little sack of joy.
        </p>
        <p className=" font-semibold text-purple-400 mb-2">
          It might take 5-10 minutes to generate your baby.
        </p>
      </div>
      <form
        className="w-full flex flex-col gap-2 items-center"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-row justify-center items-center gap-2">
          <img
            src="https://illustrations.popsy.co/amber/man-holding-a-heart.svg"
            className="w-8"
          />
          <span>Like Dad</span>
          <label className="switch">
            <input type="checkbox" name="gender" />
            <span className="slider round"></span>
          </label>
          <span>Like Mom</span>
          <img
            src="https://illustrations.popsy.co/amber/woman-holding-a-heart.svg"
            className="w-8"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex flex-col w-[250px] mx-auto sm:mx-0 sm:w-full gap-2 border-2 border-sky-400 rounded-md  max-w-[300px]">
            <input
              type="file"
              className="flex-grow"
              name="dad"
              accept=".jpg, .jpeg, .png"
              onInput={(e) =>
                setPreview1(URL.createObjectURL(e.target.files[0]))
              }
            />
            <img
              src={
                preview1 || "https://illustrations.popsy.co/sky/studying.svg"
              }
              className="w-full h-full"
            />
          </div>
          <div className="flex flex-col w-[250px] mx-auto sm:mx-0 sm:w-full gap-2 border-2 border-pink-400 rounded-md max-w-[300px]">
            <input
              type="file"
              className="flex-grow"
              name="mom"
              accept=".jpg, .jpeg, .png"
              onInput={(e) =>
                setPreview2(URL.createObjectURL(e.target.files[0]))
              }
            />
            <img
              src={
                preview2 ||
                "https://illustrations.popsy.co/pink/student-going-to-school.svg"
              }
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="flex flex-row justify-center items-center">
          <button
            className="button rounded-lg bg-purple-500"
            type="submit"
            disabled={prediction}
          >
            Go!
          </button>
          <img
            src="https://illustrations.popsy.co/amber/paper-plane.svg"
            className="w-20"
          ></img>
        </div>
      </form>

      {error && <div>{error}</div>}

      {prediction && (
        <>
          {prediction.output && (
            <div className="image-wrapper mt-5">
              <Image fill src={prediction.output} alt="output" sizes="100vw" />
            </div>
          )}
          <p className="py-3 text-sm opacity-50">status: {prediction.status}</p>
        </>
      )}
    </div>
  );
}
