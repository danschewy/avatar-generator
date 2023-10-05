import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import AdSense from "../components/AdSense";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: e.target.prompt.value,
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
      console.log({ prediction });
      setPrediction(prediction);
    }
  };

  return (
    <div className="h-screen flex flex-row justify-center">
      <Head>
        <title>Dream Avatar</title>
      </Head>
      <AdSense adSlot={7637284651} />

      <div className="container flex h-full max-w-2xl flex-col items-center p-5">
        <AdSense adSlot={2281016195} />
        <h1 className="py-6 text-center font-bold text-2xl">
          Generate Your Dream Avatar
        </h1>
        <form className="w-full flex" onSubmit={handleSubmit}>
          <input
            type="text"
            className="flex-grow"
            name="prompt"
            placeholder="Try something like 'A husky dog police officer.'"
          />
          <button className="button" type="submit">
            Go!
          </button>
        </form>
        {error && <div>{error}</div>}
        {prediction && (
          <>
            {prediction.output && (
              <div className="image-wrapper mt-5">
                <Image
                  fill
                  src={prediction.output[prediction.output.length - 1]}
                  alt="output"
                  sizes="100vw"
                />
              </div>
            )}
            <p className="py-3 text-sm opacity-50">
              status: {prediction.status}
            </p>
          </>
        )}
        <AdSense adSlot={5359687249} />
      </div>
      <AdSense adSlot={7062569589} />
    </div>
  );
}
